package chatmemory

import (
	milvusindexer "SuperBizAgent/internal/ai/indexer"
	"SuperBizAgent/internal/taskrecord"
	"SuperBizAgent/utility/client"
	"SuperBizAgent/utility/common"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/cloudwego/eino/schema"
)

const (
	Kind            = "chat_memory"
	contentMaxBytes = 8000
	defaultTimeout  = 30 * time.Second
)

func MemoryID(taskID string) string {
	return "chat-memory-" + strings.TrimSpace(taskID)
}

func SourceForTaskID(taskID string) string {
	return "chat-memory:" + strings.TrimSpace(taskID)
}

func StoreTask(ctx context.Context, task taskrecord.Task) (string, error) {
	ctx, cancel := withDefaultTimeout(ctx)
	defer cancel()

	doc := taskDocument(task)
	if doc.ID == "" {
		return "", fmt.Errorf("task id is empty")
	}
	if strings.TrimSpace(doc.Content) == "" {
		return "", fmt.Errorf("chat memory content is empty")
	}
	if err := DeleteBySource(ctx, SourceForTaskID(task.ID)); err != nil {
		return "", err
	}
	indexer, err := milvusindexer.NewMilvusIndexer(ctx)
	if err != nil {
		return "", err
	}
	ids, err := indexer.Store(ctx, []*schema.Document{doc})
	if err != nil {
		return "", err
	}
	if len(ids) == 0 {
		return doc.ID, nil
	}
	return ids[0], nil
}

func DeleteTask(ctx context.Context, taskID string) error {
	return DeleteBySource(ctx, SourceForTaskID(taskID))
}

func DeleteBySource(ctx context.Context, source string) error {
	ctx, cancel := withDefaultTimeout(ctx)
	defer cancel()

	source = strings.TrimSpace(source)
	if source == "" {
		return nil
	}
	cli, err := client.NewMilvusClient(ctx)
	if err != nil {
		return err
	}
	defer cli.Close()

	expr := fmt.Sprintf(`metadata["_source"] == "%s"`, EscapeMilvusString(source))
	queryResult, err := cli.Query(ctx, common.MilvusCollectionName, []string{}, expr, []string{"id"})
	if err != nil {
		return err
	}
	if len(queryResult) == 0 {
		return nil
	}
	var idsToDelete []string
	for _, column := range queryResult {
		if column.Name() != "id" {
			continue
		}
		for i := 0; i < column.Len(); i++ {
			id, err := column.GetAsString(i)
			if err == nil {
				idsToDelete = append(idsToDelete, id)
			}
		}
	}
	if len(idsToDelete) == 0 {
		return nil
	}
	escapedIDs := make([]string, 0, len(idsToDelete))
	for _, id := range idsToDelete {
		escapedIDs = append(escapedIDs, EscapeMilvusString(id))
	}
	deleteExpr := fmt.Sprintf(`id in ["%s"]`, strings.Join(escapedIDs, `","`))
	return cli.Delete(ctx, common.MilvusCollectionName, "", deleteExpr)
}

func withDefaultTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if _, ok := ctx.Deadline(); ok {
		return ctx, func() {}
	}
	return context.WithTimeout(ctx, defaultTimeout)
}

func EscapeMilvusString(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	return strings.ReplaceAll(value, `"`, `\"`)
}

func taskDocument(task taskrecord.Task) *schema.Document {
	content := fmt.Sprintf("用户问题：%s\n助手回答：%s", strings.TrimSpace(task.Question), strings.TrimSpace(task.Answer))
	return &schema.Document{
		ID:      MemoryID(task.ID),
		Content: truncateUTF8Bytes(content, contentMaxBytes),
		MetaData: map[string]any{
			"kind":      Kind,
			"_source":   SourceForTaskID(task.ID),
			"taskId":    task.ID,
			"sessionId": task.SessionID,
			"traceId":   task.TraceID,
			"title":     task.Title,
			"mode":      string(task.Mode),
		},
	}
}

func truncateUTF8Bytes(value string, maxBytes int) string {
	if maxBytes <= 0 || len(value) <= maxBytes {
		return value
	}
	suffix := "\n...(已截断)"
	limit := maxBytes - len(suffix)
	if limit <= 0 {
		return ""
	}
	last := 0
	for i := range value {
		if i > limit {
			break
		}
		last = i
	}
	if last <= 0 {
		return suffix
	}
	return strings.TrimSpace(value[:last]) + suffix
}
