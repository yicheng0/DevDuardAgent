package knowledge

import (
	"SuperBizAgent/internal/ai/agent/knowledge_index_pipeline"
	indexer2 "SuperBizAgent/internal/ai/indexer"
	loader2 "SuperBizAgent/internal/ai/loader"
	"SuperBizAgent/utility/client"
	"SuperBizAgent/utility/common"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/components/document"
	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound     = errors.New("knowledge document not found")
	ErrTaskNotFound         = errors.New("knowledge task not found")
	ErrUnsupportedExtension = errors.New("unsupported knowledge file extension")
	ErrUploadTooLarge       = errors.New("knowledge file exceeds size limit")
	ErrTaskNotCancelable    = errors.New("knowledge task is not cancelable")
	ErrDocumentNotCleanable = errors.New("knowledge document is not cleanable")
)

const (
	defaultIndexTimeout = 10 * time.Minute
	cancelMessage       = "任务已取消"
	timeoutMessage      = "索引超时"
)

type Config struct {
	FileDir           string
	AllowedExtensions []string
	MaxUploadBytes    int64
	IndexTimeout      time.Duration
}

type UploadResult struct {
	Document Document
	Task     *Task
	Deduped  bool
}

type ReindexAllResult struct {
	Tasks []Task
}

type indexResult struct {
	chunkCount int
	source     string
}

type Service struct {
	cfg               Config
	store             *StateStore
	taskCh            chan string
	startOne          sync.Once
	runningMu         sync.Mutex
	runningTasks      map[string]context.CancelFunc
	indexDocumentFn   func(context.Context, string) (indexResult, error)
	deleteDocumentFn  func(context.Context, string) error
	cleanupDocumentFn func(context.Context, string) error
}

func NewService(cfg Config) *Service {
	cfg = normalizeConfig(cfg)
	return &Service{
		cfg:          cfg,
		store:        NewStateStore(cfg.FileDir),
		taskCh:       make(chan string, 128),
		runningTasks: make(map[string]context.CancelFunc),
	}
}

func (s *Service) Upload(ctx context.Context, fileName string, content io.Reader) (*UploadResult, error) {
	s.startWorker()
	baseName := filepath.Base(strings.TrimSpace(fileName))
	if baseName == "." || baseName == "" {
		return nil, fmt.Errorf("invalid file name")
	}
	if err := s.validateFileName(baseName); err != nil {
		return nil, err
	}
	if err := os.MkdirAll(s.cfg.FileDir, 0755); err != nil {
		return nil, fmt.Errorf("create knowledge file dir: %w", err)
	}

	targetPath := filepath.Join(s.cfg.FileDir, baseName)
	tmp, err := os.CreateTemp(s.cfg.FileDir, ".upload-*")
	if err != nil {
		return nil, fmt.Errorf("create upload tmp: %w", err)
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	h := sha256.New()
	written, err := io.Copy(tmp, io.TeeReader(io.LimitReader(content, s.cfg.MaxUploadBytes+1), h))
	closeErr := tmp.Close()
	if err != nil {
		return nil, fmt.Errorf("save upload tmp: %w", err)
	}
	if closeErr != nil {
		return nil, fmt.Errorf("close upload tmp: %w", closeErr)
	}
	if written > s.cfg.MaxUploadBytes {
		return nil, ErrUploadTooLarge
	}
	sum := hex.EncodeToString(h.Sum(nil))

	now := time.Now()
	var result UploadResult
	var enqueueTaskID string
	err = s.store.Update(func(state *State) error {
		if existing := findReadyDocumentByHash(state, sum); existing != nil {
			result.Document = *existing
			result.Deduped = true
			return nil
		}

		doc := findDocumentByName(state, baseName)
		if doc == nil {
			enabled := true
			doc = &Document{
				ID:        uuid.NewString(),
				FileName:  baseName,
				Enabled:   &enabled,
				CreatedAt: now,
			}
			state.Documents[doc.ID] = doc
		}
		enabled := true
		doc.Enabled = &enabled
		if err := os.Rename(tmpPath, targetPath); err != nil {
			return fmt.Errorf("store upload file: %w", err)
		}

		task := &Task{
			ID:         uuid.NewString(),
			DocumentID: doc.ID,
			Type:       TaskTypeIndex,
			Status:     TaskStatusQueued,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		doc.FilePath = targetPath
		doc.Source = targetPath
		doc.SHA256 = sum
		doc.Size = written
		doc.Status = DocumentStatusIndexing
		doc.ChunkCount = 0
		doc.ActiveTaskID = task.ID
		doc.UpdatedAt = now
		doc.LastError = ""
		state.Tasks[task.ID] = task

		result.Document = *doc
		taskCopy := *task
		result.Task = &taskCopy
		enqueueTaskID = task.ID
		return nil
	})
	if err != nil {
		return nil, err
	}
	if enqueueTaskID != "" {
		s.enqueue(enqueueTaskID)
	}
	return &result, nil
}

func (s *Service) Documents() ([]Document, error) {
	return s.store.Documents()
}

func DisabledDocumentSources(ctx context.Context) ([]string, error) {
	cfg := ConfigFromRuntime(ctx)
	docs, err := NewStateStore(cfg.FileDir).Documents()
	if err != nil {
		return nil, err
	}
	sources := make([]string, 0)
	for _, doc := range docs {
		doc := doc
		if documentEnabled(&doc) {
			continue
		}
		source := cleanupSource(&doc)
		if source != "" {
			sources = append(sources, source)
		}
	}
	return sources, nil
}

func (s *Service) Task(id string) (*Task, error) {
	return s.store.Task(id)
}

func (s *Service) Reindex(ctx context.Context, documentID string) (*Task, error) {
	s.startWorker()
	now := time.Now()
	var taskCopy *Task
	err := s.store.Update(func(state *State) error {
		doc, ok := state.Documents[documentID]
		if !ok || doc.Status == DocumentStatusDeleted {
			return ErrDocumentNotFound
		}
		if strings.TrimSpace(doc.FilePath) == "" {
			return fmt.Errorf("document file path is empty")
		}
		if _, err := os.Stat(doc.FilePath); err != nil {
			return fmt.Errorf("stat document file: %w", err)
		}
		task := &Task{
			ID:         uuid.NewString(),
			DocumentID: doc.ID,
			Type:       TaskTypeReindex,
			Status:     TaskStatusQueued,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		doc.Status = DocumentStatusIndexing
		doc.ActiveTaskID = task.ID
		doc.LastError = ""
		doc.UpdatedAt = now
		state.Tasks[task.ID] = task
		cp := *task
		taskCopy = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	s.enqueue(taskCopy.ID)
	return taskCopy, nil
}

func (s *Service) ReindexAll(ctx context.Context) (*ReindexAllResult, error) {
	s.startWorker()
	now := time.Now()
	var tasks []Task
	err := s.store.Update(func(state *State) error {
		for _, doc := range state.Documents {
			if doc == nil || doc.Status == DocumentStatusDeleted || doc.Status == DocumentStatusIndexing || strings.TrimSpace(doc.ActiveTaskID) != "" {
				continue
			}
			if !documentEnabled(doc) || strings.TrimSpace(doc.FilePath) == "" {
				continue
			}
			if _, err := os.Stat(doc.FilePath); err != nil {
				continue
			}
			task := &Task{
				ID:         uuid.NewString(),
				DocumentID: doc.ID,
				Type:       TaskTypeReindex,
				Status:     TaskStatusQueued,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			doc.Status = DocumentStatusIndexing
			doc.ActiveTaskID = task.ID
			doc.LastError = ""
			doc.UpdatedAt = now
			state.Tasks[task.ID] = task
			tasks = append(tasks, *task)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	for _, task := range tasks {
		s.enqueue(task.ID)
	}
	return &ReindexAllResult{Tasks: tasks}, nil
}

func (s *Service) SetDocumentEnabled(ctx context.Context, documentID string, enabled bool) (*Document, error) {
	var docCopy *Document
	now := time.Now()
	err := s.store.Update(func(state *State) error {
		doc, ok := state.Documents[documentID]
		if !ok || doc.Status == DocumentStatusDeleted {
			return ErrDocumentNotFound
		}
		doc.Enabled = &enabled
		doc.UpdatedAt = now
		cp := *doc
		docCopy = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	return docCopy, nil
}

func (s *Service) Delete(ctx context.Context, documentID string) (*Task, error) {
	s.startWorker()
	now := time.Now()
	var taskCopy *Task
	err := s.store.Update(func(state *State) error {
		doc, ok := state.Documents[documentID]
		if !ok || doc.Status == DocumentStatusDeleted {
			return ErrDocumentNotFound
		}
		task := &Task{
			ID:         uuid.NewString(),
			DocumentID: doc.ID,
			Type:       TaskTypeDelete,
			Status:     TaskStatusQueued,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		doc.ActiveTaskID = task.ID
		doc.LastError = ""
		doc.UpdatedAt = now
		state.Tasks[task.ID] = task
		cp := *task
		taskCopy = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	s.enqueue(taskCopy.ID)
	return taskCopy, nil
}

func (s *Service) Cleanup(ctx context.Context, documentID string) (*Task, error) {
	s.startWorker()
	now := time.Now()
	var taskCopy *Task
	err := s.store.Update(func(state *State) error {
		doc, ok := state.Documents[documentID]
		if !ok || doc.Status == DocumentStatusDeleted {
			return ErrDocumentNotFound
		}
		if !isCleanableDocumentStatus(doc.Status) {
			return ErrDocumentNotCleanable
		}
		task := &Task{
			ID:         uuid.NewString(),
			DocumentID: doc.ID,
			Type:       TaskTypeCleanup,
			Status:     TaskStatusQueued,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		doc.ActiveTaskID = task.ID
		doc.UpdatedAt = now
		state.Tasks[task.ID] = task
		cp := *task
		taskCopy = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	s.enqueue(taskCopy.ID)
	return taskCopy, nil
}

func (s *Service) CancelTask(ctx context.Context, taskID string) (*Task, error) {
	taskID = strings.TrimSpace(taskID)
	if taskID == "" {
		return nil, ErrTaskNotFound
	}

	var taskCopy *Task
	var cancel context.CancelFunc
	now := time.Now()
	err := s.store.Update(func(state *State) error {
		task, ok := state.Tasks[taskID]
		if !ok {
			return ErrTaskNotFound
		}
		if !isIndexingTask(task.Type) {
			return ErrTaskNotCancelable
		}
		switch task.Status {
		case TaskStatusQueued, TaskStatusRunning:
			if task.Status == TaskStatusRunning {
				s.runningMu.Lock()
				cancel = s.runningTasks[taskID]
				s.runningMu.Unlock()
			}
			task.Status = TaskStatusCanceled
			task.Error = cancelMessage
			task.FinishedAt = &now
			task.UpdatedAt = now
			if doc := state.Documents[task.DocumentID]; doc != nil {
				doc.Status = DocumentStatusCanceled
				doc.ActiveTaskID = ""
				doc.LastError = cancelMessage
				doc.UpdatedAt = now
			}
		default:
		}
		cp := *task
		taskCopy = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	if cancel != nil {
		cancel()
	}
	return taskCopy, nil
}

func isIndexingTask(taskType TaskType) bool {
	return taskType == TaskTypeIndex || taskType == TaskTypeReindex
}

func (s *Service) runTask(taskID string) {
	ctx, cancel := context.WithTimeout(context.Background(), s.cfg.IndexTimeout)
	defer cancel()

	var taskType TaskType
	var docID string
	started := time.Now()
	if err := s.store.Update(func(state *State) error {
		task, ok := state.Tasks[taskID]
		if !ok {
			return ErrTaskNotFound
		}
		if task.Status == TaskStatusCanceled {
			return ErrTaskNotCancelable
		}
		task.Status = TaskStatusRunning
		task.StartedAt = &started
		task.UpdatedAt = started
		taskType = task.Type
		docID = task.DocumentID
		return nil
	}); err != nil {
		return
	}
	s.runningMu.Lock()
	s.runningTasks[taskID] = cancel
	s.runningMu.Unlock()
	defer func() {
		s.runningMu.Lock()
		delete(s.runningTasks, taskID)
		s.runningMu.Unlock()
	}()

	var idxResult indexResult
	var err error
	switch taskType {
	case TaskTypeDelete:
		err = s.runDeleteDocument(ctx, docID)
	case TaskTypeCleanup:
		err = s.runCleanupDocument(ctx, docID)
	default:
		idxResult, err = s.runIndexDocument(ctx, docID)
	}
	finished := time.Now()
	_ = s.store.Update(func(state *State) error {
		task, ok := state.Tasks[taskID]
		if !ok {
			return ErrTaskNotFound
		}
		if task.Status == TaskStatusCanceled {
			return nil
		}
		doc := state.Documents[task.DocumentID]
		task.FinishedAt = &finished
		task.UpdatedAt = finished
		cancelReason := cancellationReason(ctx, err)
		if cancelReason != "" {
			task.Status = TaskStatusCanceled
			task.Error = cancelReason
			if doc != nil {
				doc.Status = DocumentStatusCanceled
				doc.ActiveTaskID = ""
				doc.LastError = cancelReason
				doc.UpdatedAt = finished
			}
			return nil
		}
		if err != nil {
			task.Status = TaskStatusFailed
			task.Error = err.Error()
			if doc != nil {
				if task.Type == TaskTypeDelete {
					doc.Status = DocumentStatusDeleteFailed
				} else if task.Type == TaskTypeCleanup {
					doc.Status = DocumentStatusDeleteFailed
				} else {
					doc.Status = DocumentStatusFailed
				}
				doc.ActiveTaskID = ""
				doc.LastError = err.Error()
				doc.UpdatedAt = finished
			}
			return nil
		}
		task.Status = TaskStatusSucceeded
		task.Error = ""
		if doc != nil {
			doc.ActiveTaskID = ""
			doc.LastError = ""
			doc.UpdatedAt = finished
			if task.Type == TaskTypeDelete || task.Type == TaskTypeCleanup {
				doc.Status = DocumentStatusDeleted
			} else {
				doc.Status = DocumentStatusReady
				doc.ChunkCount = idxResult.chunkCount
				if idxResult.source != "" {
					doc.Source = idxResult.source
				}
				doc.LastIndexedAt = &finished
			}
		}
		return nil
	})
}

func (s *Service) indexDocument(ctx context.Context, documentID string) (indexResult, error) {
	doc, err := s.store.Document(documentID)
	if err != nil {
		return indexResult{}, err
	}
	docs, err := loadSourceDocs(ctx, doc.FilePath)
	if err != nil {
		return indexResult{}, err
	}
	if len(docs) == 0 {
		return indexResult{}, fmt.Errorf("no document loaded from %s", doc.FilePath)
	}
	source := fmt.Sprint(docs[0].MetaData["_source"])
	if source == "" {
		source = doc.FilePath
	}
	if err := deleteMilvusBySource(ctx, source); err != nil {
		return indexResult{}, err
	}
	tfr, err := knowledge_index_pipeline.NewDocumentTransformer(ctx)
	if err != nil {
		return indexResult{}, err
	}
	chunks, err := tfr.Transform(ctx, docs)
	if err != nil {
		return indexResult{}, fmt.Errorf("split document failed: %w", err)
	}
	for i, chunk := range chunks {
		if chunk.MetaData == nil {
			chunk.MetaData = make(map[string]any)
		}
		chunk.MetaData["document_id"] = doc.ID
		chunk.MetaData["file_name"] = doc.FileName
		chunk.MetaData["source"] = source
		chunk.MetaData["chunk_index"] = i
		chunk.MetaData["enabled"] = documentEnabled(doc)
	}
	ids, err := indexer2.StoreDocuments(ctx, chunks)
	if err != nil {
		return indexResult{}, fmt.Errorf("store document chunks failed: %w", err)
	}
	return indexResult{chunkCount: len(ids), source: source}, nil
}

func (s *Service) runIndexDocument(ctx context.Context, documentID string) (indexResult, error) {
	if s.indexDocumentFn != nil {
		return s.indexDocumentFn(ctx, documentID)
	}
	return s.indexDocument(ctx, documentID)
}

func (s *Service) deleteDocumentData(ctx context.Context, documentID string) error {
	doc, err := s.store.Document(documentID)
	if err != nil {
		return err
	}
	var source string
	docs, loadErr := loadSourceDocs(ctx, doc.FilePath)
	if loadErr == nil && len(docs) > 0 {
		source = fmt.Sprint(docs[0].MetaData["_source"])
	}
	if source == "" {
		source = doc.Source
	}
	if source == "" {
		source = doc.FilePath
	}
	if err := deleteMilvusBySource(ctx, source); err != nil {
		return err
	}
	if doc.FilePath != "" {
		if err := os.Remove(doc.FilePath); err != nil && !errors.Is(err, os.ErrNotExist) {
			return fmt.Errorf("remove document file: %w", err)
		}
	}
	_ = s.store.Update(func(state *State) error {
		delete(state.Documents, documentID)
		return nil
	})
	return nil
}

func (s *Service) runDeleteDocument(ctx context.Context, documentID string) error {
	if s.deleteDocumentFn != nil {
		return s.deleteDocumentFn(ctx, documentID)
	}
	return s.deleteDocumentData(ctx, documentID)
}

func (s *Service) cleanupDocumentData(ctx context.Context, documentID string) error {
	doc, err := s.store.Document(documentID)
	if err != nil {
		return err
	}
	source := cleanupSource(doc)
	if source != "" {
		if err := deleteMilvusBySource(ctx, source); err != nil {
			return err
		}
	}
	if doc.FilePath != "" {
		if err := os.Remove(doc.FilePath); err != nil && !errors.Is(err, os.ErrNotExist) {
			return fmt.Errorf("remove document file: %w", err)
		}
	}
	_ = s.store.Update(func(state *State) error {
		delete(state.Documents, documentID)
		return nil
	})
	return nil
}

func (s *Service) runCleanupDocument(ctx context.Context, documentID string) error {
	if s.cleanupDocumentFn != nil {
		return s.cleanupDocumentFn(ctx, documentID)
	}
	return s.cleanupDocumentData(ctx, documentID)
}

func cleanupSource(doc *Document) string {
	if doc == nil {
		return ""
	}
	if strings.TrimSpace(doc.Source) != "" {
		return doc.Source
	}
	return doc.FilePath
}

func documentEnabled(doc *Document) bool {
	return doc == nil || doc.Enabled == nil || *doc.Enabled
}

func cancellationReason(ctx context.Context, err error) string {
	if errors.Is(err, context.Canceled) || errors.Is(ctx.Err(), context.Canceled) {
		return cancelMessage
	}
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(ctx.Err(), context.DeadlineExceeded) {
		return timeoutMessage
	}
	return ""
}

func isCleanableDocumentStatus(status DocumentStatus) bool {
	return status == DocumentStatusFailed || status == DocumentStatusCanceled || status == DocumentStatusDeleteFailed
}

func (s *Service) startWorker() {
	s.startOne.Do(func() {
		go func() {
			for taskID := range s.taskCh {
				s.runTask(taskID)
			}
		}()
	})
}

func (s *Service) enqueue(taskID string) {
	s.taskCh <- taskID
}

func (s *Service) validateFileName(name string) error {
	ext := strings.ToLower(filepath.Ext(name))
	for _, allowed := range s.cfg.AllowedExtensions {
		if ext == allowed {
			return nil
		}
	}
	return ErrUnsupportedExtension
}

func loadSourceDocs(ctx context.Context, path string) ([]*schema.Document, error) {
	loader, err := loader2.NewFileLoader(ctx)
	if err != nil {
		return nil, err
	}
	return loader.Load(ctx, document.Source{URI: path})
}

func deleteMilvusBySource(ctx context.Context, source string) error {
	cli, err := client.NewMilvusClient(ctx)
	if err != nil {
		return err
	}
	expr := fmt.Sprintf(`metadata["_source"] == "%s"`, escapeMilvusString(source))
	queryResult, err := cli.Query(ctx, common.MilvusCollectionName, []string{}, expr, []string{"id"})
	if err != nil {
		return err
	}
	if len(queryResult) == 0 {
		return nil
	}
	var idsToDelete []string
	for _, column := range queryResult {
		if column.Name() != "id" {
			continue
		}
		for i := 0; i < column.Len(); i++ {
			id, err := column.GetAsString(i)
			if err == nil {
				idsToDelete = append(idsToDelete, id)
			}
		}
	}
	if len(idsToDelete) == 0 {
		return nil
	}
	escapedIDs := make([]string, 0, len(idsToDelete))
	for _, id := range idsToDelete {
		escapedIDs = append(escapedIDs, escapeMilvusString(id))
	}
	deleteExpr := fmt.Sprintf(`id in ["%s"]`, strings.Join(escapedIDs, `","`))
	return cli.Delete(ctx, common.MilvusCollectionName, "", deleteExpr)
}

func escapeMilvusString(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	return strings.ReplaceAll(value, `"`, `\"`)
}

func findReadyDocumentByHash(state *State, hash string) *Document {
	for _, doc := range state.Documents {
		if doc.SHA256 == hash && doc.Status == DocumentStatusReady {
			return doc
		}
	}
	return nil
}

func findDocumentByName(state *State, name string) *Document {
	for _, doc := range state.Documents {
		if doc.FileName == name && doc.Status != DocumentStatusDeleted {
			return doc
		}
	}
	return nil
}

func normalizeConfig(cfg Config) Config {
	if cfg.FileDir == "" {
		cfg.FileDir = common.FileDir
	}
	if len(cfg.AllowedExtensions) == 0 {
		cfg.AllowedExtensions = []string{".md", ".markdown", ".txt"}
	}
	for i := range cfg.AllowedExtensions {
		cfg.AllowedExtensions[i] = strings.ToLower(strings.TrimSpace(cfg.AllowedExtensions[i]))
	}
	if cfg.MaxUploadBytes <= 0 {
		cfg.MaxUploadBytes = 20 * 1024 * 1024
	}
	if cfg.IndexTimeout <= 0 {
		cfg.IndexTimeout = defaultIndexTimeout
	}
	return cfg
}
