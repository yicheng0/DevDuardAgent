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
	g.Meta   `path:"/chat_stream" method:"post" summary:"流式对话"`
	Id       string
	Question string
}

type ChatStreamRes struct {
}

type FileUploadReq struct {
	g.Meta `path:"/upload" method:"post" mime:"multipart/form-data" summary:"文件上传"`
}

type FileUploadRes struct {
	FileName string `json:"fileName" dc:"保存的文件名"`
	FilePath string `json:"filePath" dc:"文件保存路径"`
	FileSize int64  `json:"fileSize" dc:"文件大小(字节)"`
}

type AIOpsReq struct {
	g.Meta `path:"/ai_ops" method:"post" summary:"AI运维"`
}

type AIOpsRes struct {
	Result string   `json:"result"`
	Detail []string `json:"detail"`
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
