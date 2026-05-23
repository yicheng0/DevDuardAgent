package chat

import (
	"SuperBizAgent/api/chat/v1"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	chatopenai "github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/schema"
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

func TestChatModelGenerateSendsMaxCompletionTokens(t *testing.T) {
	var seenBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer sk-test" {
			t.Fatalf("unexpected authorization header: %s", got)
		}
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read request body: %v", err)
		}
		if err := json.Unmarshal(body, &seenBody); err != nil {
			t.Fatalf("decode request body: %v", err)
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
		})
	}))
	defer server.Close()

	model, err := chatopenai.NewChatModel(context.Background(), &chatopenai.ChatModelConfig{
		Model:               "gpt-5",
		APIKey:              "sk-test",
		BaseURL:             server.URL + "/v1",
		MaxCompletionTokens: ptrInt(42),
		HTTPClient:          &http.Client{},
	})
	if err != nil {
		t.Fatalf("new chat model: %v", err)
	}

	_, err = model.Generate(context.Background(), []*schema.Message{
		schema.UserMessage("Hi"),
	})
	if err != nil {
		t.Fatalf("generate: %v", err)
	}
	if got := int(seenBody["max_completion_tokens"].(float64)); got != 42 {
		t.Fatalf("max_completion_tokens = %d, want 42", got)
	}
	if _, ok := seenBody["max_output_tokens"]; ok {
		t.Fatalf("did not expect max_output_tokens in chat completions body: %#v", seenBody)
	}
}

func TestChatModelGenerateSendsExtraFieldMaxOutputTokens(t *testing.T) {
	var seenBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read request body: %v", err)
		}
		if err := json.Unmarshal(body, &seenBody); err != nil {
			t.Fatalf("decode request body: %v", err)
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
		})
	}))
	defer server.Close()

	model, err := chatopenai.NewChatModel(context.Background(), &chatopenai.ChatModelConfig{
		Model:      "gpt-5",
		APIKey:     "sk-test",
		BaseURL:    server.URL + "/v1",
		HTTPClient: &http.Client{},
	})
	if err != nil {
		t.Fatalf("new chat model: %v", err)
	}

	_, err = model.Generate(context.Background(), []*schema.Message{
		schema.UserMessage("Hi"),
	}, chatopenai.WithExtraFields(map[string]any{
		"max_output_tokens": 66,
	}))
	if err != nil {
		t.Fatalf("generate: %v", err)
	}
	if got := int(seenBody["max_output_tokens"].(float64)); got != 66 {
		t.Fatalf("max_output_tokens = %d, want 66", got)
	}
}

func TestChatModelGenerateRejectsEventStreamResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("data: {\"id\":\"chat-test\"}\n\n"))
	}))
	defer server.Close()

	model, err := chatopenai.NewChatModel(context.Background(), &chatopenai.ChatModelConfig{
		Model:      "gpt-5",
		APIKey:     "sk-test",
		BaseURL:    server.URL + "/v1",
		HTTPClient: &http.Client{},
	})
	if err != nil {
		t.Fatalf("new chat model: %v", err)
	}

	_, err = model.Generate(context.Background(), []*schema.Message{
		schema.UserMessage("Hi"),
	})
	if err == nil || !strings.Contains(err.Error(), "invalid character") {
		t.Fatalf("expected JSON parse error, got: %v", err)
	}
}

func TestChatModelGenerateRejectsEmptyBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	model, err := chatopenai.NewChatModel(context.Background(), &chatopenai.ChatModelConfig{
		Model:      "gpt-5",
		APIKey:     "sk-test",
		BaseURL:    server.URL + "/v1",
		HTTPClient: &http.Client{},
	})
	if err != nil {
		t.Fatalf("new chat model: %v", err)
	}

	_, err = model.Generate(context.Background(), []*schema.Message{
		schema.UserMessage("Hi"),
	})
	if err == nil {
		t.Fatal("expected error for empty response body")
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

func ptrInt(v int) *int {
	return &v
}

type assertErr string

func (e assertErr) Error() string {
	return string(e)
}
