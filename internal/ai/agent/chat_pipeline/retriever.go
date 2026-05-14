package chat_pipeline

import (
	retriever2 "SuperBizAgent/internal/ai/retriever"
	"context"
	"log"

	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
)

func newRetriever(ctx context.Context) (rtr retriever.Retriever, err error) {
	rtr, err = retriever2.NewMilvusRetriever(ctx)
	if err != nil {
		log.Printf("chat retriever disabled: %v", err)
		return safeRetriever{reason: err.Error()}, nil
	}
	return safeRetriever{next: rtr}, nil
}

type safeRetriever struct {
	next   retriever.Retriever
	reason string
}

func (r safeRetriever) Retrieve(ctx context.Context, query string, opts ...retriever.Option) ([]*schema.Document, error) {
	if r.next == nil {
		return []*schema.Document{}, nil
	}
	opts = append(opts, retriever2.WithEnabledDocumentsOnly(ctx))
	docs, err := r.next.Retrieve(ctx, query, opts...)
	if err != nil {
		log.Printf("chat retriever failed, fallback to no documents: %v", err)
		return []*schema.Document{}, nil
	}
	return docs, nil
}
