package chat

import (
	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/ai/agent/chat_pipeline"
	"SuperBizAgent/internal/taskrecord"
	agenttrace "SuperBizAgent/internal/trace"
	"SuperBizAgent/utility/log_call_back"
	"SuperBizAgent/utility/mem"
	"context"

	"github.com/cloudwego/eino/compose"
)

func (c *ControllerV1) Chat(ctx context.Context, req *v1.ChatReq) (res *v1.ChatRes, err error) {
	id := req.Id
	msg := req.Question
	traceID := agenttrace.NewTraceID(id)
	taskID := newAgentTaskID()
	taskStore := newTaskRecordStore()
	_, _ = taskStore.Create(taskrecord.CreateInput{
		ID:        taskID,
		SessionID: id,
		TraceID:   traceID,
		Question:  msg,
		Mode:      taskrecord.ModeQuick,
	})
	c.traces.StartRun(id, traceID)
	ctx = agenttrace.WithRun(ctx, id, traceID, nil)
	userMessage := &chat_pipeline.UserMessage{
		ID:      id,
		Query:   msg,
		History: mem.GetSimpleMemory(id).GetMessages(),
	}

	runner, err := chat_pipeline.BuildChatAgent(ctx)
	if err != nil {
		_ = completeAgentTask(taskStore, c.traces, taskID, traceID, taskrecord.StatusFailed, "", err.Error())
		return nil, err
	}

	out, err := runner.Invoke(ctx, userMessage, compose.WithCallbacks(
		log_call_back.LogCallback(nil),
		log_call_back.TraceCallback(c.traces),
	))
	if err != nil {
		_ = completeAgentTask(taskStore, c.traces, taskID, traceID, taskrecord.StatusFailed, "", err.Error())
		return nil, err
	}
	c.traces.UpsertStep(traceID, agenttrace.Step{
		ID:          "respond",
		Title:       "生成处置建议",
		Status:      agenttrace.StatusCompleted,
		Phase:       agenttrace.PhaseRespond,
		Description: "输出面向运维人员的最终答复",
		Result:      "响应生成完成",
		RiskLevel:   agenttrace.RiskLow,
	})
	res = &v1.ChatRes{
		Answer: out.Content,
	}
	mem.GetSimpleMemory(id).SetUserMessage(msg)
	mem.GetSimpleMemory(id).SetAssistantMessage(out.Content)
	_ = completeAgentTask(taskStore, c.traces, taskID, traceID, taskrecord.StatusSucceeded, out.Content, "")

	return res, nil
}
