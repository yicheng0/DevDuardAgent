package v1

import (
	"github.com/gogf/gf/v2/frame/g"
)

type ChatReq struct {
	g.Meta   `path:"/chat" method:"post" summary:"对话"`
	Id       string
	Question string
}

type ChatRes struct {
	Answer string `json:"answer"`
}

type ChatStreamReq struct {
	g.Meta   `path:"/chat_stream" method:"get,post" summary:"流式对话"`
	Id       string `json:"Id" form:"Id"`
	Question string `json:"Question" form:"Question"`
}

type ChatStreamRes struct {
}

type FileUploadReq struct {
	g.Meta `path:"/upload" method:"post" mime:"multipart/form-data" summary:"文件上传"`
}

type FileUploadRes struct {
	FileName   string `json:"fileName" dc:"保存的文件名"`
	FilePath   string `json:"filePath" dc:"文件保存路径"`
	FileSize   int64  `json:"fileSize" dc:"文件大小(字节)"`
	DocumentID string `json:"documentId" dc:"知识库文档ID"`
	TaskID     string `json:"taskId" dc:"索引任务ID"`
	Status     string `json:"status" dc:"文档索引状态"`
}

type AIOpsReq struct {
	g.Meta `path:"/ai_ops" method:"post" summary:"AI运维"`
}

type AIOpsRes struct {
	Result string   `json:"result"`
	Detail []string `json:"detail"`
}

type LogAnalyzeReq struct {
	g.Meta    `path:"/logs/analyze" method:"post" summary:"日志分析"`
	Region    string `json:"region"`
	TopicID   string `json:"topicId"`
	Query     string `json:"query"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Limit     int    `json:"limit"`
}

type LogSample struct {
	Timestamp string `json:"timestamp,omitempty"`
	Level     string `json:"level,omitempty"`
	Message   string `json:"message"`
}

type LogAnalyzeRes struct {
	Summary     string      `json:"summary"`
	Patterns    []string    `json:"patterns"`
	Samples     []LogSample `json:"samples"`
	Suggestions []string    `json:"suggestions"`
	RawResult   string      `json:"rawResult"`
	ToolName    string      `json:"toolName"`
	ResultCount int         `json:"resultCount"`
	StartedAt   string      `json:"startedAt"`
	EndedAt     string      `json:"endedAt"`
	DurationMs  int64       `json:"durationMs"`
}

type ConfigSecret struct {
	HasValue bool   `json:"hasValue"`
	Value    string `json:"value"`
}

type ModelRuntimeConfig struct {
	APIKey  ConfigSecret `json:"apiKey"`
	BaseURL string       `json:"baseUrl"`
	Model   string       `json:"model"`
}

type EmbeddingRuntimeConfig struct {
	APIKey  ConfigSecret `json:"apiKey"`
	BaseURL string       `json:"baseUrl"`
	Model   string       `json:"model"`
}

type RuntimeConfig struct {
	QuickModel    ModelRuntimeConfig     `json:"quickModel"`
	ThinkModel    ModelRuntimeConfig     `json:"thinkModel"`
	Embedding     EmbeddingRuntimeConfig `json:"embedding"`
	MCPURL        string                 `json:"mcpUrl"`
	MilvusAddress string                 `json:"milvusAddress"`
	FileDir       string                 `json:"fileDir"`
}

type GetRuntimeConfigReq struct {
	g.Meta `path:"/config/runtime" method:"get" summary:"获取运行配置"`
}

type GetRuntimeConfigRes struct {
	Config RuntimeConfig `json:"config"`
}

type UpdateRuntimeConfigReq struct {
	g.Meta `path:"/config/runtime" method:"put" summary:"更新运行配置"`
	Config RuntimeConfig `json:"config"`
}

type UpdateRuntimeConfigRes struct {
	Config RuntimeConfig `json:"config"`
}

type ConfigTestReq struct {
	g.Meta `path:"/config/test" method:"post" summary:"测试运行配置"`
	Target string        `json:"target"`
	Config RuntimeConfig `json:"config"`
}

type ConfigTestRes struct {
	Target  string `json:"target"`
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

type KnowledgeDocument struct {
	ID            string `json:"id"`
	FileName      string `json:"fileName"`
	FilePath      string `json:"filePath"`
	Source        string `json:"source"`
	SHA256        string `json:"sha256"`
	Size          int64  `json:"size"`
	Status        string `json:"status"`
	ChunkCount    int    `json:"chunkCount"`
	ActiveTaskID  string `json:"activeTaskId,omitempty"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
	LastIndexedAt string `json:"lastIndexedAt,omitempty"`
	LastError     string `json:"lastError,omitempty"`
}

type KnowledgeTask struct {
	ID         string `json:"id"`
	DocumentID string `json:"documentId"`
	Type       string `json:"type"`
	Status     string `json:"status"`
	StartedAt  string `json:"startedAt,omitempty"`
	FinishedAt string `json:"finishedAt,omitempty"`
	Error      string `json:"error,omitempty"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type KnowledgeDocumentsReq struct {
	g.Meta `path:"/knowledge/documents" method:"get" summary:"知识库文档列表"`
}

type KnowledgeDocumentsRes struct {
	Documents []KnowledgeDocument `json:"documents"`
}

type KnowledgeTaskReq struct {
	g.Meta `path:"/knowledge/tasks" method:"get" summary:"知识库任务详情"`
	ID     string `json:"id"`
}

type KnowledgeTaskRes struct {
	Task KnowledgeTask `json:"task"`
}

type KnowledgeReindexReq struct {
	g.Meta     `path:"/knowledge/documents/reindex" method:"post" summary:"重建知识库文档索引"`
	DocumentID string `json:"documentId"`
}

type KnowledgeReindexRes struct {
	Task KnowledgeTask `json:"task"`
}

type KnowledgeDeleteReq struct {
	g.Meta `path:"/knowledge/documents" method:"delete" summary:"删除知识库文档"`
	ID     string `json:"id"`
}

type KnowledgeDeleteRes struct {
	Task KnowledgeTask `json:"task"`
}

type AgentTaskStatus string

type AgentTaskStep struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Status      string   `json:"status"`
	Phase       string   `json:"phase,omitempty"`
	ToolName    string   `json:"toolName,omitempty"`
	Description string   `json:"description,omitempty"`
	Result      string   `json:"result,omitempty"`
	Evidence    []string `json:"evidence,omitempty"`
	DurationMs  int64    `json:"durationMs,omitempty"`
	RiskLevel   string   `json:"riskLevel,omitempty"`
}

type AgentTask struct {
	ID         string          `json:"id"`
	SessionID  string          `json:"sessionId"`
	TraceID    string          `json:"traceId"`
	Title      string          `json:"title"`
	Question   string          `json:"question"`
	Answer     string          `json:"answer,omitempty"`
	Mode       string          `json:"mode"`
	Status     string          `json:"status"`
	Steps      []AgentTaskStep `json:"steps,omitempty"`
	Error      string          `json:"error,omitempty"`
	CreatedAt  string          `json:"createdAt"`
	UpdatedAt  string          `json:"updatedAt"`
	StartedAt  string          `json:"startedAt,omitempty"`
	FinishedAt string          `json:"finishedAt,omitempty"`
}

type AgentTasksReq struct {
	g.Meta  `path:"/tasks" method:"get" summary:"Agent任务记录列表"`
	Status  string `json:"status"`
	Keyword string `json:"keyword"`
	Limit   int    `json:"limit"`
}

type AgentTasksRes struct {
	Tasks []AgentTask `json:"tasks"`
}

type AgentTaskDetailReq struct {
	g.Meta `path:"/tasks/detail" method:"get" summary:"Agent任务记录详情"`
	ID     string `json:"id"`
}

type AgentTaskDetailRes struct {
	Task AgentTask `json:"task"`
}
