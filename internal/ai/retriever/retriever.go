package retriever

import (
	"SuperBizAgent/internal/ai/embedder"
	"SuperBizAgent/internal/knowledge"
	"SuperBizAgent/utility/client"
	"SuperBizAgent/utility/common"
	"context"
	"strings"

	"github.com/cloudwego/eino-ext/components/retriever/milvus"
	"github.com/cloudwego/eino/components/retriever"
)

func WithEnabledDocumentsOnly(ctx context.Context) retriever.Option {
	return retriever.WrapImplSpecificOptFn[milvus.ImplOptions](func(options *milvus.ImplOptions) {
		filter := disabledDocumentsFilter(ctx)
		if filter == "" {
			return
		}
		if strings.TrimSpace(options.Filter) != "" {
			options.Filter = "(" + options.Filter + ") && (" + filter + ")"
			return
		}
		options.Filter = filter
	})
}

func disabledDocumentsFilter(ctx context.Context) string {
	sources, err := knowledge.DisabledDocumentSources(ctx)
	if err != nil || len(sources) == 0 {
		return ""
	}
	parts := make([]string, 0, len(sources)*2)
	for _, source := range sources {
		source = strings.TrimSpace(source)
		if source == "" {
			continue
		}
		escaped := escapeMilvusString(source)
		parts = append(parts, `metadata["_source"] != "`+escaped+`"`)
		parts = append(parts, `metadata["source"] != "`+escaped+`"`)
	}
	return strings.Join(parts, " && ")
}

func escapeMilvusString(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	return strings.ReplaceAll(value, `"`, `\"`)
}

func NewMilvusRetriever(ctx context.Context) (rtr retriever.Retriever, err error) {
	cli, err := client.NewMilvusClient(ctx)
	if err != nil {
		return nil, err
	}
	eb, err := embedder.DoubaoEmbedding(ctx)
	if err != nil {
		return nil, err
	}
	r, err := milvus.NewRetriever(ctx, &milvus.RetrieverConfig{
		Client:      cli,
		Collection:  common.MilvusCollectionName,
		VectorField: "vector",
		OutputFields: []string{
			"*",
		},
		TopK:      knowledge.RetrievalTopK(ctx),
		Embedding: eb,
	})
	if err != nil {
		return nil, err
	}
	return r, nil
}
