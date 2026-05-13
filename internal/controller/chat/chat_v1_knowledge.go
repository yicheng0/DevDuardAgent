package chat

import (
	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/knowledge"
	"context"
	"errors"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
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

func knowledgeHTTPError(ctx context.Context, err error) error {
	req := g.RequestFromCtx(ctx)
	switch {
	case errors.Is(err, knowledge.ErrDocumentNotFound), errors.Is(err, knowledge.ErrTaskNotFound):
		req.Response.Status = http.StatusNotFound
	case errors.Is(err, knowledge.ErrUnsupportedExtension), errors.Is(err, knowledge.ErrUploadTooLarge):
		req.Response.Status = http.StatusBadRequest
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
