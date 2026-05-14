package chat

import (
	"SuperBizAgent/api/chat/v1"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestChatModelConnectionUsesLiveEndpoint(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer sk-live-test" {
			t.Fatalf("unexpected authorization header: %s", got)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"id":     "chat-test",
			"object": "chat.completion",
			"choices": []map[string]any{
				{
					"index": 0,
					"message": map[string]any{
						"role":    "assistant",
						"content": "ok",
					},
					"finish_reason": "stop",
				},
			},
			"usage": map[string]any{
				"prompt_tokens":     1,
				"completion_tokens": 1,
				"total_tokens":      2,
			},
		})
	}))
	defer server.Close()

	cfg := &yamlRuntimeConfig{}
	res := testChatModelConnection(context.Background(), "quick_model", "快速模型", "sk-live-test", server.URL+"/v1", "test-model", cfg)
	if !res.OK {
		t.Fatalf("expected live test to pass, got: %s", res.Message)
	}
	if !strings.Contains(res.Message, "连通成功") {
		t.Fatalf("expected success message, got: %s", res.Message)
	}
}

func TestEmbeddingConnectionUsesLiveEndpoint(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/embeddings" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer sk-embedding-test" {
			t.Fatalf("unexpected authorization header: %s", got)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"object": "list",
			"data": []map[string]any{
				{
					"object":    "embedding",
					"index":     0,
					"embedding": []float64{0.1, 0.2, 0.3},
				},
			},
			"model": "test-embedding",
			"usage": map[string]any{
				"prompt_tokens": 1,
				"total_tokens":  1,
			},
		})
	}))
	defer server.Close()

	cfg := &yamlRuntimeConfig{}
	cfg.Embedding.APIKey = "sk-embedding-test"
	cfg.Embedding.BaseURL = server.URL + "/v1"
	cfg.Embedding.Model = "test-embedding"

	res := testEmbeddingConnection(context.Background(), "embedding", cfg)
	if !res.OK {
		t.Fatalf("expected embedding test to pass, got: %s", res.Message)
	}
	if !strings.Contains(res.Message, "维度 3") {
		t.Fatalf("expected vector dimension in message, got: %s", res.Message)
	}
}

func TestConfigTestFailureMasksSecrets(t *testing.T) {
	secret := "sk-secret-value"
	cfg := &yamlRuntimeConfig{}
	cfg.QuickModel.APIKey = secret

	message := sanitizeConfigTestError(assertErr("upstream rejected "+secret), cfg)
	if strings.Contains(message, secret) {
		t.Fatalf("expected secret to be masked, got: %s", message)
	}
	if !strings.Contains(message, maskedSecret) {
		t.Fatalf("expected masked secret marker, got: %s", message)
	}
}

func TestRuntimeConfigPreservesIndexTimeoutSeconds(t *testing.T) {
	cfg := &yamlRuntimeConfig{}
	cfg.QuickModel.BaseURL = "https://quick.example/v1"
	cfg.QuickModel.Model = "quick"
	cfg.ThinkModel.BaseURL = "https://think.example/v1"
	cfg.ThinkModel.Model = "think"
	cfg.Embedding.BaseURL = "https://embedding.example/v1"
	cfg.Embedding.Model = "embedding"
	cfg.FileDir = "/tmp/devguard"
	cfg.Milvus.Address = "localhost:19530"
	cfg.Knowledge.IndexTimeoutSeconds = 900

	runtimeCfg := toRuntimeConfig(cfg, true)
	if runtimeCfg.IndexTimeoutSeconds != 900 {
		t.Fatalf("IndexTimeoutSeconds = %d, want 900", runtimeCfg.IndexTimeoutSeconds)
	}
	roundTrip := fromRuntimeConfig(runtimeCfg)
	if roundTrip.Knowledge.IndexTimeoutSeconds != 900 {
		t.Fatalf("roundTrip IndexTimeoutSeconds = %d, want 900", roundTrip.Knowledge.IndexTimeoutSeconds)
	}
}

func TestRuntimeConfigDefaultsIndexTimeoutSeconds(t *testing.T) {
	cfg := &yamlRuntimeConfig{}
	applyRuntimeDefaults(cfg)
	if cfg.Knowledge.IndexTimeoutSeconds != defaultIndexTimeoutSeconds {
		t.Fatalf("IndexTimeoutSeconds = %d, want %d", cfg.Knowledge.IndexTimeoutSeconds, defaultIndexTimeoutSeconds)
	}

	roundTrip := fromRuntimeConfig(v1.RuntimeConfig{})
	if roundTrip.Knowledge.IndexTimeoutSeconds != defaultIndexTimeoutSeconds {
		t.Fatalf("fromRuntimeConfig default IndexTimeoutSeconds = %d, want %d", roundTrip.Knowledge.IndexTimeoutSeconds, defaultIndexTimeoutSeconds)
	}
}

func TestValidateRuntimeConfigRejectsInvalidIndexTimeoutSeconds(t *testing.T) {
	cfg := validRuntimeConfigForTest()
	cfg.Knowledge.IndexTimeoutSeconds = minIndexTimeoutSeconds - 1
	if err := validateRuntimeConfig(cfg); err == nil || !strings.Contains(err.Error(), "索引超时秒数") {
		t.Fatalf("validateRuntimeConfig low timeout err = %v, want index timeout error", err)
	}

	cfg = validRuntimeConfigForTest()
	cfg.Knowledge.IndexTimeoutSeconds = maxIndexTimeoutSeconds + 1
	if err := validateRuntimeConfig(cfg); err == nil || !strings.Contains(err.Error(), "索引超时秒数") {
		t.Fatalf("validateRuntimeConfig high timeout err = %v, want index timeout error", err)
	}
}

func validRuntimeConfigForTest() *yamlRuntimeConfig {
	cfg := &yamlRuntimeConfig{}
	cfg.QuickModel.BaseURL = "https://quick.example/v1"
	cfg.QuickModel.Model = "quick"
	cfg.ThinkModel.BaseURL = "https://think.example/v1"
	cfg.ThinkModel.Model = "think"
	cfg.Embedding.BaseURL = "https://embedding.example/v1"
	cfg.Embedding.Model = "embedding"
	cfg.FileDir = "/tmp/devguard"
	cfg.Milvus.Address = "localhost:19530"
	cfg.Knowledge.IndexTimeoutSeconds = defaultIndexTimeoutSeconds
	return cfg
}

type assertErr string

func (e assertErr) Error() string {
	return string(e)
}
