package chat

import (
	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/ai/agent/chat_pipeline"
	agenttrace "SuperBizAgent/internal/trace"
	"SuperBizAgent/utility/log_call_back"
	"SuperBizAgent/utility/mem"
	"context"
	"errors"
	"io"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/gogf/gf/v2/frame/g"
)

func (c *ControllerV1) ChatStream(ctx context.Context, req *v1.ChatStreamReq) (res *v1.ChatStreamRes, err error) {
	id := req.Id
	msg := req.Question
	traceID := agenttrace.NewTraceID(id)

	ctx = context.WithValue(ctx, "client_id", req.Id)
	client, err := c.service.Create(ctx, g.RequestFromCtx(ctx))
	if err != nil {
		return nil, err
	}
	c.traces.StartRun(id, traceID)
	ctx = agenttrace.WithRun(ctx, id, traceID, func(event agenttrace.Event) {
		client.SendJSON("trace", event)
	})

	userMessage := &chat_pipeline.UserMessage{
		ID:      id,
		Query:   msg,
		History: mem.GetSimpleMemory(id).GetMessages(),
	}

	runner, err := chat_pipeline.BuildChatAgent(ctx)
	if err != nil {
		client.SendJSON("error", map[string]string{"traceId": traceID, "message": err.Error()})
		return nil, err
	}
	sr, err := runner.Stream(ctx, userMessage, compose.WithCallbacks(
		log_call_back.LogCallback(nil),
		log_call_back.TraceCallback(c.traces),
	))
	if err != nil {
		client.SendJSON("error", map[string]string{"traceId": traceID, "message": err.Error()})
		return nil, err
	}
	defer sr.Close()

	var fullResponse strings.Builder

	defer func() {
		completeResponse := fullResponse.String()
		if completeResponse != "" {
			mem.GetSimpleMemory(id).SetMessages(schema.UserMessage(msg))
			mem.GetSimpleMemory(id).SetMessages(schema.SystemMessage(completeResponse))
		}
	}()

	for {
		chunk, err := sr.Recv()
		if errors.Is(err, io.EOF) {
			respond := agenttrace.Step{
				ID:          "respond",
				Title:       "生成处置建议",
				Status:      agenttrace.StatusCompleted,
				Phase:       agenttrace.PhaseRespond,
				Description: "输出面向运维人员的最终答复",
				Result:      "响应生成完成",
				RiskLevel:   agenttrace.RiskLow,
			}
			c.traces.UpsertStep(traceID, respond)
			client.SendJSON("trace", agenttrace.Event{TraceID: traceID, Step: respond})
			client.SendJSON("done", map[string]string{"traceId": traceID, "message": "Stream completed"})
			return &v1.ChatStreamRes{}, nil
		}
		if err != nil {
			client.SendJSON("error", map[string]string{"traceId": traceID, "message": err.Error()})
			return &v1.ChatStreamRes{}, nil
		}
		fullResponse.WriteString(chunk.Content)
		client.SendJSON("message", map[string]string{"content": chunk.Content})
	}
}
