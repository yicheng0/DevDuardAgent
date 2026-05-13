package chat

import (
	"SuperBizAgent/api/chat/v1"
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

	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gcfg"
	"github.com/gogf/gf/v2/os/gfile"
	"gopkg.in/yaml.v3"
)

const (
	maskedSecret      = "********"
	defaultAdminToken = "devguard-admin"
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
		if target == "quick_model" && cfg.QuickModel.APIKey == maskedSecret {
			return &v1.ConfigTestRes{Target: target, OK: false, Message: "请先输入快速模型 API Key"}, nil
		}
		if target == "think_model" && cfg.ThinkModel.APIKey == maskedSecret {
			return &v1.ConfigTestRes{Target: target, OK: false, Message: "请先输入深度模型 API Key"}, nil
		}
		return &v1.ConfigTestRes{Target: target, OK: true, Message: "模型配置格式有效"}, nil
	case "embedding":
		if cfg.Embedding.APIKey == maskedSecret {
			return &v1.ConfigTestRes{Target: target, OK: false, Message: "请先输入 Embedding API Key"}, nil
		}
		return &v1.ConfigTestRes{Target: target, OK: true, Message: "Embedding 配置格式有效"}, nil
	case "milvus":
		if cfg.Milvus.Address == "" {
			return &v1.ConfigTestRes{Target: target, OK: false, Message: "Milvus 地址不能为空"}, nil
		}
		return &v1.ConfigTestRes{Target: target, OK: true, Message: "Milvus 地址格式有效"}, nil
	default:
		return nil, gerror.New("未知测试目标")
	}
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
		MCPURL:        cfg.MCPURL,
		MilvusAddress: cfg.Milvus.Address,
		FileDir:       cfg.FileDir,
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
