package chat

import (
	"SuperBizAgent/api/chat/v1"
	milvushelper "SuperBizAgent/utility/client"
	"SuperBizAgent/utility/common"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	chatopenai "github.com/cloudwego/eino-ext/components/model/openai"
	embeddingopenai "github.com/cloudwego/eino-ext/libs/acl/openai"
	"github.com/cloudwego/eino/schema"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gcfg"
	"github.com/gogf/gf/v2/os/gfile"
	"gopkg.in/yaml.v3"
)

const (
	maskedSecret               = "********"
	defaultAdminToken          = "devguard-admin"
	configTestTimeout          = 15 * time.Second
	defaultIndexTimeoutSeconds = int64(600)
	minIndexTimeoutSeconds     = int64(30)
	maxIndexTimeoutSeconds     = int64(3600)
)

var configWriteMu sync.Mutex

type yamlRuntimeConfig struct {
	Server struct {
		Address     string `yaml:"address"`
		OpenAPIPath string `yaml:"openapiPath"`
		SwaggerPath string `yaml:"swaggerPath"`
	} `yaml:"server"`
	Logger map[string]interface{} `yaml:"logger"`
	Admin  struct {
		ConfigToken string `yaml:"config_token"`
	} `yaml:"admin"`
	ThinkModel struct {
		APIKey  string `yaml:"api_key"`
		BaseURL string `yaml:"base_url"`
		Model   string `yaml:"model"`
	} `yaml:"ds_think_chat_model"`
	QuickModel struct {
		APIKey  string `yaml:"api_key"`
		BaseURL string `yaml:"base_url"`
		Model   string `yaml:"model"`
	} `yaml:"ds_quick_chat_model"`
	Embedding struct {
		APIKey  string `yaml:"api_key"`
		BaseURL string `yaml:"base_url"`
		Model   string `yaml:"model"`
	} `yaml:"doubao_embedding_model"`
	FileDir string `yaml:"file_dir"`
	MCPURL  string `yaml:"mcp_url"`
	Milvus  struct {
		Address string `yaml:"address"`
	} `yaml:"milvus"`
	Knowledge struct {
		RetrievalTopK       int      `yaml:"retrieval_top_k"`
		MaxUploadMB         int64    `yaml:"max_upload_mb"`
		IndexTimeoutSeconds int64    `yaml:"index_timeout_seconds"`
		AllowedExtensions   []string `yaml:"allowed_extensions"`
	} `yaml:"knowledge"`
}

func (c *ControllerV1) GetRuntimeConfig(ctx context.Context, req *v1.GetRuntimeConfigReq) (res *v1.GetRuntimeConfigRes, err error) {
	if err := requireConfigAdmin(ctx); err != nil {
		return nil, err
	}
	cfg, err := loadRuntimeConfig(ctx)
	if err != nil {
		return nil, err
	}
	return &v1.GetRuntimeConfigRes{Config: toRuntimeConfig(cfg, true)}, nil
}

func (c *ControllerV1) UpdateRuntimeConfig(ctx context.Context, req *v1.UpdateRuntimeConfigReq) (res *v1.UpdateRuntimeConfigRes, err error) {
	if err := requireConfigAdmin(ctx); err != nil {
		return nil, err
	}
	configWriteMu.Lock()
	defer configWriteMu.Unlock()

	cfg, err := loadRuntimeConfig(ctx)
	if err != nil {
		return nil, err
	}
	next := req.Config
	mergeSecret := func(in v1.ConfigSecret, current string) string {
		value := strings.TrimSpace(in.Value)
		if value == "" || value == maskedSecret {
			return current
		}
		return value
	}

	cfg.QuickModel.APIKey = mergeSecret(next.QuickModel.APIKey, cfg.QuickModel.APIKey)
	cfg.QuickModel.BaseURL = strings.TrimSpace(next.QuickModel.BaseURL)
	cfg.QuickModel.Model = strings.TrimSpace(next.QuickModel.Model)
	cfg.ThinkModel.APIKey = mergeSecret(next.ThinkModel.APIKey, cfg.ThinkModel.APIKey)
	cfg.ThinkModel.BaseURL = strings.TrimSpace(next.ThinkModel.BaseURL)
	cfg.ThinkModel.Model = strings.TrimSpace(next.ThinkModel.Model)
	cfg.Embedding.APIKey = mergeSecret(next.Embedding.APIKey, cfg.Embedding.APIKey)
	cfg.Embedding.BaseURL = strings.TrimSpace(next.Embedding.BaseURL)
	cfg.Embedding.Model = strings.TrimSpace(next.Embedding.Model)
	cfg.MCPURL = strings.TrimSpace(next.MCPURL)
	cfg.Milvus.Address = strings.TrimSpace(next.MilvusAddress)
	cfg.FileDir = strings.TrimSpace(next.FileDir)
	cfg.Knowledge.IndexTimeoutSeconds = next.IndexTimeoutSeconds

	if err := validateRuntimeConfig(cfg); err != nil {
		return nil, err
	}
	if err := gfile.Mkdir(cfg.FileDir); err != nil {
		return nil, gerror.Wrapf(err, "创建文件目录失败: %s", cfg.FileDir)
	}
	if err := saveRuntimeConfig(ctx, cfg); err != nil {
		return nil, err
	}
	common.FileDir = cfg.FileDir
	clearConfigCache()
	return &v1.UpdateRuntimeConfigRes{Config: toRuntimeConfig(cfg, true)}, nil
}

func (c *ControllerV1) ConfigTest(ctx context.Context, req *v1.ConfigTestReq) (res *v1.ConfigTestRes, err error) {
	if err := requireConfigAdmin(ctx); err != nil {
		return nil, err
	}
	target := strings.TrimSpace(req.Target)
	cfg := fromRuntimeConfig(req.Config)
	current, loadErr := loadRuntimeConfig(ctx)
	if loadErr == nil {
		mergeMaskedTestSecret(cfg, current)
	}
	if err := validateRuntimeConfig(cfg); err != nil {
		return &v1.ConfigTestRes{Target: target, OK: false, Message: err.Error()}, nil
	}

	switch target {
	case "quick_model", "think_model":
		if target == "quick_model" {
			return testChatModelConnection(ctx, target, "快速模型", cfg.QuickModel.APIKey, cfg.QuickModel.BaseURL, cfg.QuickModel.Model, cfg), nil
		}
		return testChatModelConnection(ctx, target, "深度模型", cfg.ThinkModel.APIKey, cfg.ThinkModel.BaseURL, cfg.ThinkModel.Model, cfg), nil
	case "embedding":
		return testEmbeddingConnection(ctx, target, cfg), nil
	case "milvus":
		return testMilvusConnection(ctx, target, cfg), nil
	default:
		return nil, gerror.New("未知测试目标")
	}
}

func testChatModelConnection(ctx context.Context, target, label, apiKey, baseURL, modelName string, cfg *yamlRuntimeConfig) *v1.ConfigTestRes {
	if strings.TrimSpace(apiKey) == "" || apiKey == maskedSecret {
		return &v1.ConfigTestRes{Target: target, OK: false, Message: fmt.Sprintf("请先输入%s API Key", label)}
	}
	started := time.Now()
	testCtx, cancel := context.WithTimeout(ctx, configTestTimeout)
	defer cancel()

	cm, err := chatopenai.NewChatModel(testCtx, &chatopenai.ChatModelConfig{
		Model:      modelName,
		APIKey:     apiKey,
		BaseURL:    baseURL,
		HTTPClient: &http.Client{Timeout: configTestTimeout},
	})
	if err != nil {
		return configTestFailure(target, fmt.Sprintf("%s客户端创建失败: %s", label, sanitizeConfigTestError(err, cfg)))
	}
	msg, err := cm.Generate(testCtx, []*schema.Message{
		schema.UserMessage("连通测试。请只回复 ok。"),
	})
	if err != nil {
		return configTestFailure(target, fmt.Sprintf("%s连通失败: %s", label, sanitizeConfigTestError(err, cfg)))
	}
	if msg == nil || strings.TrimSpace(msg.Content) == "" {
		return configTestFailure(target, fmt.Sprintf("%s连通失败: 响应为空", label))
	}
	return &v1.ConfigTestRes{
		Target:  target,
		OK:      true,
		Message: fmt.Sprintf("%s连通成功，用时 %dms", label, time.Since(started).Milliseconds()),
	}
}

func testEmbeddingConnection(ctx context.Context, target string, cfg *yamlRuntimeConfig) *v1.ConfigTestRes {
	if strings.TrimSpace(cfg.Embedding.APIKey) == "" || cfg.Embedding.APIKey == maskedSecret {
		return &v1.ConfigTestRes{Target: target, OK: false, Message: "请先输入 Embedding API Key"}
	}
	started := time.Now()
	testCtx, cancel := context.WithTimeout(ctx, configTestTimeout)
	defer cancel()

	dim := 2048
	encodingFmt := embeddingopenai.EmbeddingEncodingFormatFloat
	eb, err := embeddingopenai.NewEmbeddingClient(testCtx, &embeddingopenai.EmbeddingConfig{
		Model:          cfg.Embedding.Model,
		APIKey:         cfg.Embedding.APIKey,
		BaseURL:        cfg.Embedding.BaseURL,
		HTTPClient:     &http.Client{Timeout: configTestTimeout},
		EncodingFormat: &encodingFmt,
		Dimensions:     &dim,
	})
	if err != nil {
		return configTestFailure(target, fmt.Sprintf("Embedding 客户端创建失败: %s", sanitizeConfigTestError(err, cfg)))
	}
	vectors, err := eb.EmbedStrings(testCtx, []string{"devguard connectivity test"})
	if err != nil {
		return configTestFailure(target, fmt.Sprintf("Embedding 连通失败: %s", sanitizeConfigTestError(err, cfg)))
	}
	if len(vectors) == 0 || len(vectors[0]) == 0 {
		return configTestFailure(target, "Embedding 连通失败: 返回向量为空")
	}
	return &v1.ConfigTestRes{
		Target:  target,
		OK:      true,
		Message: fmt.Sprintf("Embedding 连通成功，维度 %d，用时 %dms", len(vectors[0]), time.Since(started).Milliseconds()),
	}
}

func testMilvusConnection(ctx context.Context, target string, cfg *yamlRuntimeConfig) *v1.ConfigTestRes {
	if strings.TrimSpace(cfg.Milvus.Address) == "" {
		return &v1.ConfigTestRes{Target: target, OK: false, Message: "Milvus 地址不能为空"}
	}
	health := milvushelper.CheckMilvusHealth(ctx, cfg.Milvus.Address)
	if !health.OK {
		message := health.Message
		if strings.TrimSpace(health.Error) != "" {
			message += ": " + sanitizeConfigTestError(errors.New(health.Error), cfg)
		}
		return configTestFailure(target, message)
	}
	return &v1.ConfigTestRes{
		Target:  target,
		OK:      true,
		Message: fmt.Sprintf("Milvus 健康，用时 %dms", health.DurationMs),
	}
}

func configTestFailure(target, message string) *v1.ConfigTestRes {
	return &v1.ConfigTestRes{Target: target, OK: false, Message: message}
}

func sanitizeConfigTestError(err error, cfg *yamlRuntimeConfig) string {
	message := strings.TrimSpace(err.Error())
	for _, secret := range []string{
		cfg.QuickModel.APIKey,
		cfg.ThinkModel.APIKey,
		cfg.Embedding.APIKey,
	} {
		secret = strings.TrimSpace(secret)
		if secret != "" && secret != maskedSecret {
			message = strings.ReplaceAll(message, secret, maskedSecret)
		}
	}
	return message
}

func requireConfigAdmin(ctx context.Context) error {
	req := g.RequestFromCtx(ctx)
	if req == nil {
		return gerror.New("missing request")
	}
	expected := strings.TrimSpace(os.Getenv("DEVGUARD_CONFIG_TOKEN"))
	if expected == "" {
		v, err := g.Cfg().Get(ctx, "admin.config_token", defaultAdminToken)
		if err == nil {
			expected = strings.TrimSpace(v.String())
		}
	}
	token := strings.TrimSpace(req.Header.Get("X-Admin-Token"))
	if expected == "" || token == "" || token != expected {
		req.Response.Status = http.StatusUnauthorized
		return gerror.New("未授权访问配置接口")
	}
	return nil
}

func loadRuntimeConfig(ctx context.Context) (*yamlRuntimeConfig, error) {
	path, err := runtimeConfigPath(ctx)
	if err != nil {
		return nil, err
	}
	content := gfile.GetContents(path)
	if content == "" {
		return nil, fmt.Errorf("配置文件为空或不存在: %s", path)
	}
	cfg := &yamlRuntimeConfig{}
	if err := yaml.Unmarshal([]byte(content), cfg); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}
	applyRuntimeDefaults(cfg)
	return cfg, nil
}

func saveRuntimeConfig(ctx context.Context, cfg *yamlRuntimeConfig) error {
	path, err := runtimeConfigPath(ctx)
	if err != nil {
		return err
	}
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return fmt.Errorf("序列化配置失败: %w", err)
	}
	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("写入配置文件失败: %w", err)
	}
	return nil
}

func runtimeConfigPath(ctx context.Context) (string, error) {
	if adapter, ok := g.Cfg().GetAdapter().(*gcfg.AdapterFile); ok {
		if path, err := adapter.GetFilePath(); err == nil && path != "" {
			return path, nil
		}
	}
	fallback := filepath.Join("manifest", "config", "config.yaml")
	if gfile.Exists(fallback) {
		return fallback, nil
	}
	return "", errors.New("找不到运行配置文件")
}

func clearConfigCache() {
	if adapter, ok := g.Cfg().GetAdapter().(*gcfg.AdapterFile); ok {
		adapter.Clear()
	}
}

func applyRuntimeDefaults(cfg *yamlRuntimeConfig) {
	if cfg.Admin.ConfigToken == "" {
		cfg.Admin.ConfigToken = defaultAdminToken
	}
	if cfg.Milvus.Address == "" {
		cfg.Milvus.Address = "localhost:19530"
	}
	if cfg.Knowledge.RetrievalTopK <= 0 {
		cfg.Knowledge.RetrievalTopK = 5
	}
	if cfg.Knowledge.MaxUploadMB <= 0 {
		cfg.Knowledge.MaxUploadMB = 20
	}
	if cfg.Knowledge.IndexTimeoutSeconds <= 0 {
		cfg.Knowledge.IndexTimeoutSeconds = defaultIndexTimeoutSeconds
	}
	if len(cfg.Knowledge.AllowedExtensions) == 0 {
		cfg.Knowledge.AllowedExtensions = []string{".md", ".markdown", ".txt"}
	}
}

func validateRuntimeConfig(cfg *yamlRuntimeConfig) error {
	required := map[string]string{
		"快速模型 Base URL":   cfg.QuickModel.BaseURL,
		"快速模型 Model":      cfg.QuickModel.Model,
		"深度模型 Base URL":   cfg.ThinkModel.BaseURL,
		"深度模型 Model":      cfg.ThinkModel.Model,
		"Embedding Model": cfg.Embedding.Model,
		"文件目录":            cfg.FileDir,
		"Milvus 地址":       cfg.Milvus.Address,
	}
	for name, value := range required {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%s不能为空", name)
		}
	}
	for name, raw := range map[string]string{
		"快速模型 Base URL":      cfg.QuickModel.BaseURL,
		"深度模型 Base URL":      cfg.ThinkModel.BaseURL,
		"Embedding Base URL": cfg.Embedding.BaseURL,
		"MCP URL":            cfg.MCPURL,
	} {
		if strings.TrimSpace(raw) == "" {
			continue
		}
		parsed, err := url.ParseRequestURI(raw)
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			return fmt.Errorf("%s格式不正确", name)
		}
	}
	if cfg.Knowledge.IndexTimeoutSeconds < minIndexTimeoutSeconds || cfg.Knowledge.IndexTimeoutSeconds > maxIndexTimeoutSeconds {
		return fmt.Errorf("索引超时秒数必须在 %d-%d 之间", minIndexTimeoutSeconds, maxIndexTimeoutSeconds)
	}
	return nil
}

func toRuntimeConfig(cfg *yamlRuntimeConfig, mask bool) v1.RuntimeConfig {
	secret := func(value string) v1.ConfigSecret {
		if !mask {
			return v1.ConfigSecret{HasValue: value != "", Value: value}
		}
		if value == "" {
			return v1.ConfigSecret{HasValue: false, Value: ""}
		}
		return v1.ConfigSecret{HasValue: true, Value: maskedSecret}
	}
	return v1.RuntimeConfig{
		QuickModel: v1.ModelRuntimeConfig{
			APIKey:  secret(cfg.QuickModel.APIKey),
			BaseURL: cfg.QuickModel.BaseURL,
			Model:   cfg.QuickModel.Model,
		},
		ThinkModel: v1.ModelRuntimeConfig{
			APIKey:  secret(cfg.ThinkModel.APIKey),
			BaseURL: cfg.ThinkModel.BaseURL,
			Model:   cfg.ThinkModel.Model,
		},
		Embedding: v1.EmbeddingRuntimeConfig{
			APIKey:  secret(cfg.Embedding.APIKey),
			BaseURL: cfg.Embedding.BaseURL,
			Model:   cfg.Embedding.Model,
		},
		MCPURL:              cfg.MCPURL,
		MilvusAddress:       cfg.Milvus.Address,
		FileDir:             cfg.FileDir,
		IndexTimeoutSeconds: cfg.Knowledge.IndexTimeoutSeconds,
	}
}

func fromRuntimeConfig(in v1.RuntimeConfig) *yamlRuntimeConfig {
	cfg := &yamlRuntimeConfig{}
	cfg.QuickModel.APIKey = strings.TrimSpace(in.QuickModel.APIKey.Value)
	cfg.QuickModel.BaseURL = strings.TrimSpace(in.QuickModel.BaseURL)
	cfg.QuickModel.Model = strings.TrimSpace(in.QuickModel.Model)
	cfg.ThinkModel.APIKey = strings.TrimSpace(in.ThinkModel.APIKey.Value)
	cfg.ThinkModel.BaseURL = strings.TrimSpace(in.ThinkModel.BaseURL)
	cfg.ThinkModel.Model = strings.TrimSpace(in.ThinkModel.Model)
	cfg.Embedding.APIKey = strings.TrimSpace(in.Embedding.APIKey.Value)
	cfg.Embedding.BaseURL = strings.TrimSpace(in.Embedding.BaseURL)
	cfg.Embedding.Model = strings.TrimSpace(in.Embedding.Model)
	cfg.MCPURL = strings.TrimSpace(in.MCPURL)
	cfg.Milvus.Address = strings.TrimSpace(in.MilvusAddress)
	cfg.FileDir = strings.TrimSpace(in.FileDir)
	cfg.Knowledge.IndexTimeoutSeconds = in.IndexTimeoutSeconds
	applyRuntimeDefaults(cfg)
	return cfg
}

func mergeMaskedTestSecret(cfg *yamlRuntimeConfig, current *yamlRuntimeConfig) {
	if cfg.QuickModel.APIKey == "" || cfg.QuickModel.APIKey == maskedSecret {
		cfg.QuickModel.APIKey = current.QuickModel.APIKey
	}
	if cfg.ThinkModel.APIKey == "" || cfg.ThinkModel.APIKey == maskedSecret {
		cfg.ThinkModel.APIKey = current.ThinkModel.APIKey
	}
	if cfg.Embedding.APIKey == "" || cfg.Embedding.APIKey == maskedSecret {
		cfg.Embedding.APIKey = current.Embedding.APIKey
	}
}
