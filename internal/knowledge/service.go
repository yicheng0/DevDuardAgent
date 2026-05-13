package knowledge

import (
	"SuperBizAgent/internal/ai/agent/knowledge_index_pipeline"
	loader2 "SuperBizAgent/internal/ai/loader"
	"SuperBizAgent/utility/client"
	"SuperBizAgent/utility/common"
	"SuperBizAgent/utility/log_call_back"
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
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound     = errors.New("knowledge document not found")
	ErrTaskNotFound         = errors.New("knowledge task not found")
	ErrUnsupportedExtension = errors.New("unsupported knowledge file extension")
	ErrUploadTooLarge       = errors.New("knowledge file exceeds size limit")
)

type Config struct {
	FileDir           string
	AllowedExtensions []string
	MaxUploadBytes    int64
}

type UploadResult struct {
	Document Document
	Task     *Task
	Deduped  bool
}

type indexResult struct {
	chunkCount int
	source     string
}

type Service struct {
	cfg      Config
	store    *StateStore
	taskCh   chan string
	startOne sync.Once
}

func NewService(cfg Config) *Service {
	cfg = normalizeConfig(cfg)
	return &Service{
		cfg:    cfg,
		store:  NewStateStore(cfg.FileDir),
		taskCh: make(chan string, 128),
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
			doc = &Document{
				ID:        uuid.NewString(),
				FileName:  baseName,
				CreatedAt: now,
			}
			state.Documents[doc.ID] = doc
		}
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

func (s *Service) runTask(taskID string) {
	ctx := context.Background()
	var taskType TaskType
	var docID string
	started := time.Now()
	if err := s.store.Update(func(state *State) error {
		task, ok := state.Tasks[taskID]
		if !ok {
			return ErrTaskNotFound
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

	var idxResult indexResult
	var err error
	switch taskType {
	case TaskTypeDelete:
		err = s.deleteDocumentData(ctx, docID)
	default:
		idxResult, err = s.indexDocument(ctx, docID)
	}
	finished := time.Now()
	_ = s.store.Update(func(state *State) error {
		task, ok := state.Tasks[taskID]
		if !ok {
			return ErrTaskNotFound
		}
		doc := state.Documents[task.DocumentID]
		task.FinishedAt = &finished
		task.UpdatedAt = finished
		if err != nil {
			task.Status = TaskStatusFailed
			task.Error = err.Error()
			if doc != nil {
				if task.Type == TaskTypeDelete {
					doc.Status = DocumentStatusDeleteFailed
				} else {
					doc.Status = DocumentStatusFailed
				}
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
			if task.Type == TaskTypeDelete {
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
	r, err := knowledge_index_pipeline.BuildKnowledgeIndexing(ctx)
	if err != nil {
		return indexResult{}, err
	}
	ids, err := r.Invoke(ctx, document.Source{URI: doc.FilePath}, compose.WithCallbacks(log_call_back.LogCallback(nil)))
	if err != nil {
		return indexResult{}, fmt.Errorf("invoke index graph failed: %w", err)
	}
	return indexResult{chunkCount: len(ids), source: source}, nil
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
	return cfg
}
