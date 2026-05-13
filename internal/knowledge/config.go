package knowledge

import (
	"SuperBizAgent/utility/common"
	"context"
	"fmt"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

func ConfigFromRuntime(ctx context.Context) Config {
	cfg := Config{
		FileDir: common.FileDir,
	}
	if v, err := g.Cfg().Get(ctx, "file_dir"); err == nil && strings.TrimSpace(v.String()) != "" {
		cfg.FileDir = strings.TrimSpace(v.String())
	}
	if v, err := g.Cfg().Get(ctx, "knowledge.max_upload_mb"); err == nil && v.Int64() > 0 {
		cfg.MaxUploadBytes = v.Int64() * 1024 * 1024
	}
	if v, err := g.Cfg().Get(ctx, "knowledge.allowed_extensions"); err == nil {
		cfg.AllowedExtensions = normalizeAllowedExtensions(v.Strings())
	}
	return normalizeConfig(cfg)
}

func (c Config) Key() string {
	c = normalizeConfig(c)
	return fmt.Sprintf("%s|%d|%s", c.FileDir, c.MaxUploadBytes, strings.Join(c.AllowedExtensions, ","))
}

func RetrievalTopK(ctx context.Context) int {
	if v, err := g.Cfg().Get(ctx, "knowledge.retrieval_top_k"); err == nil && v.Int() > 0 {
		return v.Int()
	}
	return 5
}

func normalizeAllowedExtensions(values []string) []string {
	extensions := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.ToLower(strings.TrimSpace(value))
		if value == "" {
			continue
		}
		if !strings.HasPrefix(value, ".") {
			value = "." + value
		}
		extensions = append(extensions, value)
	}
	return extensions
}
