package chat

import (
	"SuperBizAgent/api/chat/v1"
	airetriever "SuperBizAgent/internal/ai/retriever"
	"SuperBizAgent/internal/knowledge"
	milvusclient "SuperBizAgent/utility/client"
	"context"
	"errors"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/components/retriever"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/util/gconv"
)

var (
	knowledgeServiceMu  sync.Mutex
	knowledgeServiceKey string
	knowledgeService    *knowledge.Service
)

func (c *ControllerV1) FileUpload(ctx context.Context, req *v1.FileUploadReq) (res *v1.FileUploadRes, err error) {
	r := g.RequestFromCtx(ctx)
	uploadFile := r.GetUploadFile("file")
	if uploadFile == nil {
		return nil, gerror.New("请上传文件")
	}
	src, err := uploadFile.Open()
	if err != nil {
		return nil, gerror.Wrap(err, "打开上传文件失败")
	}
	defer src.Close()

	result, err := newKnowledgeService(ctx).Upload(ctx, uploadFile.Filename, src)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	res = &v1.FileUploadRes{
		FileName:   result.Document.FileName,
		FilePath:   result.Document.FilePath,
		FileSize:   result.Document.Size,
		DocumentID: result.Document.ID,
		Status:     string(result.Document.Status),
	}
	if result.Task != nil {
		res.TaskID = result.Task.ID
	}
	return res, nil
}

func (c *ControllerV1) KnowledgeDocuments(ctx context.Context, req *v1.KnowledgeDocumentsReq) (res *v1.KnowledgeDocumentsRes, err error) {
	docs, err := newKnowledgeService(ctx).Documents()
	if err != nil {
		return nil, err
	}
	out := make([]v1.KnowledgeDocument, 0, len(docs))
	for _, doc := range docs {
		out = append(out, toKnowledgeDocument(doc))
	}
	return &v1.KnowledgeDocumentsRes{Documents: out}, nil
}

func (c *ControllerV1) KnowledgeHealth(ctx context.Context, req *v1.KnowledgeHealthReq) (res *v1.KnowledgeHealthRes, err error) {
	address := "localhost:19530"
	if v, cfgErr := g.Cfg().Get(ctx, "milvus.address"); cfgErr == nil && strings.TrimSpace(v.String()) != "" {
		address = strings.TrimSpace(v.String())
	}
	health := milvusclient.CheckMilvusHealth(ctx, address)
	return &v1.KnowledgeHealthRes{
		Address:          health.Address,
		OK:               health.OK,
		TCPOK:            health.TCPOK,
		SDKOK:            health.SDKOK,
		DatabaseOK:       health.DatabaseOK,
		CollectionOK:     health.CollectionOK,
		CollectionLoaded: health.CollectionLoaded,
		Message:          health.Message,
		Error:            health.Error,
		Suggestion:       health.Suggestion,
		DurationMs:       health.DurationMs,
	}, nil
}

func (c *ControllerV1) KnowledgeTask(ctx context.Context, req *v1.KnowledgeTaskReq) (res *v1.KnowledgeTaskRes, err error) {
	id := strings.TrimSpace(req.ID)
	if id == "" {
		return nil, gerror.New("任务ID不能为空")
	}
	task, err := newKnowledgeService(ctx).Task(id)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeTaskRes{Task: toKnowledgeTask(*task)}, nil
}

func (c *ControllerV1) KnowledgeReindex(ctx context.Context, req *v1.KnowledgeReindexReq) (res *v1.KnowledgeReindexRes, err error) {
	id := strings.TrimSpace(req.DocumentID)
	if id == "" {
		return nil, gerror.New("文档ID不能为空")
	}
	task, err := newKnowledgeService(ctx).Reindex(ctx, id)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeReindexRes{Task: toKnowledgeTask(*task)}, nil
}

func (c *ControllerV1) KnowledgeReindexAll(ctx context.Context, req *v1.KnowledgeReindexAllReq) (res *v1.KnowledgeReindexAllRes, err error) {
	result, err := newKnowledgeService(ctx).ReindexAll(ctx)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	tasks := make([]v1.KnowledgeTask, 0, len(result.Tasks))
	for _, task := range result.Tasks {
		tasks = append(tasks, toKnowledgeTask(task))
	}
	return &v1.KnowledgeReindexAllRes{Tasks: tasks}, nil
}

func (c *ControllerV1) KnowledgeSetEnabled(ctx context.Context, req *v1.KnowledgeSetEnabledReq) (res *v1.KnowledgeSetEnabledRes, err error) {
	id := strings.TrimSpace(req.DocumentID)
	if id == "" {
		return nil, gerror.New("文档ID不能为空")
	}
	doc, err := newKnowledgeService(ctx).SetDocumentEnabled(ctx, id, req.Enabled)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeSetEnabledRes{Document: toKnowledgeDocument(*doc)}, nil
}

func (c *ControllerV1) KnowledgeDelete(ctx context.Context, req *v1.KnowledgeDeleteReq) (res *v1.KnowledgeDeleteRes, err error) {
	id := strings.TrimSpace(req.ID)
	if id == "" {
		return nil, gerror.New("文档ID不能为空")
	}
	task, err := newKnowledgeService(ctx).Delete(ctx, id)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeDeleteRes{Task: toKnowledgeTask(*task)}, nil
}

func (c *ControllerV1) KnowledgeCancelTask(ctx context.Context, req *v1.KnowledgeCancelTaskReq) (res *v1.KnowledgeCancelTaskRes, err error) {
	id := strings.TrimSpace(req.TaskID)
	if id == "" {
		return nil, gerror.New("任务ID不能为空")
	}
	task, err := newKnowledgeService(ctx).CancelTask(ctx, id)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeCancelTaskRes{Task: toKnowledgeTask(*task)}, nil
}

func (c *ControllerV1) KnowledgeCleanup(ctx context.Context, req *v1.KnowledgeCleanupReq) (res *v1.KnowledgeCleanupRes, err error) {
	id := strings.TrimSpace(req.DocumentID)
	if id == "" {
		return nil, gerror.New("文档ID不能为空")
	}
	task, err := newKnowledgeService(ctx).Cleanup(ctx, id)
	if err != nil {
		return nil, knowledgeHTTPError(ctx, err)
	}
	return &v1.KnowledgeCleanupRes{Task: toKnowledgeTask(*task)}, nil
}

func (c *ControllerV1) KnowledgeSearch(ctx context.Context, req *v1.KnowledgeSearchReq) (res *v1.KnowledgeSearchRes, err error) {
	query := strings.TrimSpace(req.Query)
	if query == "" {
		return nil, gerror.New("检索问题不能为空")
	}
	topK := normalizeKnowledgeSearchTopK(req.TopK)
	rtr, err := airetriever.NewMilvusRetriever(ctx)
	if err != nil {
		return nil, gerror.Wrap(err, "初始化知识库检索器失败")
	}
	docs, err := rtr.Retrieve(ctx, query, retriever.WithTopK(topK), airetriever.WithEnabledDocumentsOnly(ctx))
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "no results found") {
			return &v1.KnowledgeSearchRes{
				Query:     query,
				TopK:      topK,
				Documents: []v1.KnowledgeSearchDocument{},
			}, nil
		}
		return nil, gerror.Wrap(err, "知识库检索失败")
	}
	sort.SliceStable(docs, func(i, j int) bool {
		return docs[i].Score() > docs[j].Score()
	})
	out := make([]v1.KnowledgeSearchDocument, 0, len(docs))
	for _, doc := range docs {
		if doc == nil {
			continue
		}
		out = append(out, v1.KnowledgeSearchDocument{
			ID:         doc.ID,
			Content:    doc.Content,
			Score:      doc.Score(),
			DocumentID: knowledgeMetadataString(doc.MetaData, "document_id"),
			FileName:   knowledgeMetadataString(doc.MetaData, "file_name", "_file_name"),
			Source:     knowledgeDocumentSource(doc.MetaData),
			Metadata:   doc.MetaData,
		})
	}
	return &v1.KnowledgeSearchRes{
		Query:     query,
		TopK:      topK,
		Documents: out,
	}, nil
}

func newKnowledgeService(ctx context.Context) *knowledge.Service {
	cfg := knowledge.ConfigFromRuntime(ctx)
	key := cfg.Key()
	knowledgeServiceMu.Lock()
	defer knowledgeServiceMu.Unlock()
	if knowledgeService == nil || knowledgeServiceKey != key {
		knowledgeService = knowledge.NewService(cfg)
		knowledgeServiceKey = key
	}
	return knowledgeService
}

func normalizeKnowledgeSearchTopK(topK int) int {
	if topK <= 0 {
		return 5
	}
	if topK > 20 {
		return 20
	}
	return topK
}

func knowledgeDocumentSource(metadata map[string]any) string {
	return knowledgeMetadataString(metadata, "_source", "source", "fileName", "file_path")
}

func knowledgeMetadataString(metadata map[string]any, keys ...string) string {
	for _, key := range keys {
		if value, ok := metadata[key]; ok {
			source := strings.TrimSpace(gconv.String(value))
			if source != "" {
				return source
			}
		}
	}
	return ""
}

func knowledgeHTTPError(ctx context.Context, err error) error {
	req := g.RequestFromCtx(ctx)
	switch {
	case errors.Is(err, knowledge.ErrDocumentNotFound), errors.Is(err, knowledge.ErrTaskNotFound):
		req.Response.Status = http.StatusNotFound
	case errors.Is(err, knowledge.ErrUnsupportedExtension), errors.Is(err, knowledge.ErrUploadTooLarge):
		req.Response.Status = http.StatusBadRequest
	case errors.Is(err, knowledge.ErrDocumentNotCleanable):
		req.Response.Status = http.StatusBadRequest
	case errors.Is(err, knowledge.ErrTaskNotCancelable):
		req.Response.Status = http.StatusConflict
	}
	return err
}

func toKnowledgeDocument(doc knowledge.Document) v1.KnowledgeDocument {
	return v1.KnowledgeDocument{
		ID:            doc.ID,
		FileName:      doc.FileName,
		FilePath:      doc.FilePath,
		Source:        doc.Source,
		SHA256:        doc.SHA256,
		Size:          doc.Size,
		Status:        string(doc.Status),
		Enabled:       doc.Enabled == nil || *doc.Enabled,
		ChunkCount:    doc.ChunkCount,
		ActiveTaskID:  doc.ActiveTaskID,
		CreatedAt:     formatTime(doc.CreatedAt),
		UpdatedAt:     formatTime(doc.UpdatedAt),
		LastIndexedAt: formatOptionalTime(doc.LastIndexedAt),
		LastError:     doc.LastError,
	}
}

func toKnowledgeTask(task knowledge.Task) v1.KnowledgeTask {
	return v1.KnowledgeTask{
		ID:         task.ID,
		DocumentID: task.DocumentID,
		Type:       string(task.Type),
		Status:     string(task.Status),
		StartedAt:  formatOptionalTime(task.StartedAt),
		FinishedAt: formatOptionalTime(task.FinishedAt),
		Error:      task.Error,
		CreatedAt:  formatTime(task.CreatedAt),
		UpdatedAt:  formatTime(task.UpdatedAt),
	}
}

func formatOptionalTime(t *time.Time) string {
	if t == nil {
		return ""
	}
	return formatTime(*t)
}

func formatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(time.RFC3339)
}
