// =================================================================================
// Code generated and maintained by GoFrame CLI tool. DO NOT EDIT.
// =================================================================================

package chat

import (
	"context"

	"SuperBizAgent/api/chat/v1"
)

type IChatV1 interface {
	Chat(ctx context.Context, req *v1.ChatReq) (res *v1.ChatRes, err error)
	ChatStream(ctx context.Context, req *v1.ChatStreamReq) (res *v1.ChatStreamRes, err error)
	FileUpload(ctx context.Context, req *v1.FileUploadReq) (res *v1.FileUploadRes, err error)
	AIOps(ctx context.Context, req *v1.AIOpsReq) (res *v1.AIOpsRes, err error)
	LogAnalyze(ctx context.Context, req *v1.LogAnalyzeReq) (res *v1.LogAnalyzeRes, err error)
	GetRuntimeConfig(ctx context.Context, req *v1.GetRuntimeConfigReq) (res *v1.GetRuntimeConfigRes, err error)
	UpdateRuntimeConfig(ctx context.Context, req *v1.UpdateRuntimeConfigReq) (res *v1.UpdateRuntimeConfigRes, err error)
	ConfigTest(ctx context.Context, req *v1.ConfigTestReq) (res *v1.ConfigTestRes, err error)
	KnowledgeDocuments(ctx context.Context, req *v1.KnowledgeDocumentsReq) (res *v1.KnowledgeDocumentsRes, err error)
	KnowledgeHealth(ctx context.Context, req *v1.KnowledgeHealthReq) (res *v1.KnowledgeHealthRes, err error)
	KnowledgeTask(ctx context.Context, req *v1.KnowledgeTaskReq) (res *v1.KnowledgeTaskRes, err error)
	KnowledgeReindex(ctx context.Context, req *v1.KnowledgeReindexReq) (res *v1.KnowledgeReindexRes, err error)
	KnowledgeReindexAll(ctx context.Context, req *v1.KnowledgeReindexAllReq) (res *v1.KnowledgeReindexAllRes, err error)
	KnowledgeSetEnabled(ctx context.Context, req *v1.KnowledgeSetEnabledReq) (res *v1.KnowledgeSetEnabledRes, err error)
	KnowledgeDelete(ctx context.Context, req *v1.KnowledgeDeleteReq) (res *v1.KnowledgeDeleteRes, err error)
	KnowledgeCancelTask(ctx context.Context, req *v1.KnowledgeCancelTaskReq) (res *v1.KnowledgeCancelTaskRes, err error)
	KnowledgeCleanup(ctx context.Context, req *v1.KnowledgeCleanupReq) (res *v1.KnowledgeCleanupRes, err error)
	KnowledgeSearch(ctx context.Context, req *v1.KnowledgeSearchReq) (res *v1.KnowledgeSearchRes, err error)
	AgentTasks(ctx context.Context, req *v1.AgentTasksReq) (res *v1.AgentTasksRes, err error)
	AgentTaskDetail(ctx context.Context, req *v1.AgentTaskDetailReq) (res *v1.AgentTaskDetailRes, err error)
	AgentTaskDelete(ctx context.Context, req *v1.AgentTaskDeleteReq) (res *v1.AgentTaskDeleteRes, err error)
	AgentTaskImportant(ctx context.Context, req *v1.AgentTaskImportantReq) (res *v1.AgentTaskImportantRes, err error)
	ChatSessionDelete(ctx context.Context, req *v1.ChatSessionDeleteReq) (res *v1.ChatSessionDeleteRes, err error)
}
