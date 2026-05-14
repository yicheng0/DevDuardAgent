package embedder

import (
	"context"
	"log"
	"net/http"
	"time"

	embeddingopenai "github.com/cloudwego/eino-ext/libs/acl/openai"
	"github.com/cloudwego/eino/components/embedding"
	"github.com/gogf/gf/v2/frame/g"
)

func DoubaoEmbedding(ctx context.Context) (eb embedding.Embedder, err error) {
	model, err := g.Cfg().Get(ctx, "doubao_embedding_model.model")
	if err != nil {
		return nil, err
	}
	api_key, err := g.Cfg().Get(ctx, "doubao_embedding_model.api_key")
	if err != nil {
		return nil, err
	}
	baseURL, err := g.Cfg().Get(ctx, "doubao_embedding_model.base_url")
	if err != nil {
		return nil, err
	}
	dim := 2048
	encodingFmt := embeddingopenai.EmbeddingEncodingFormatFloat
	embedder, err := embeddingopenai.NewEmbeddingClient(ctx, &embeddingopenai.EmbeddingConfig{
		Model:          model.String(),
		APIKey:         api_key.String(),
		BaseURL:        baseURL.String(),
		HTTPClient:     &http.Client{Timeout: 30 * time.Second},
		EncodingFormat: &encodingFmt,
		Dimensions:     &dim,
	})
	if err != nil {
		log.Printf("new embedder error: %v\n", err)
		return nil, err
	}
	return embedder, nil
}
