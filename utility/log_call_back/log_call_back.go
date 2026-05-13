package log_call_back

import (
	"SuperBizAgent/internal/trace"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"
)

type LogCallbackConfig struct {
	Detail bool
	Debug  bool
}

func LogCallback(config *LogCallbackConfig) callbacks.Handler {
	if config == nil {
		config = &LogCallbackConfig{
			Detail: true,
		}
	}

	builder := callbacks.NewHandlerBuilder()
	builder.OnStartFn(func(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
		fmt.Printf("[view start]:[%s:%s:%s]\n", info.Component, info.Type, info.Name)
		if config.Detail {
			var b []byte
			if config.Debug {
				b, _ = json.MarshalIndent(input, "", "  ")
			} else {
				b, _ = json.Marshal(input)
			}
			fmt.Printf("%s\n", string(b))
		}
		return ctx
	})
	builder.OnEndFn(func(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
		fmt.Printf("[view end]:[%s:%s:%s]\n", info.Component, info.Type, info.Name)
		return ctx
	})
	return builder.Build()
}

func TraceID(ctx context.Context) string {
	if id := trace.TraceID(ctx); id != "" {
		return id
	}
	return ""
}

func TraceCallback(store *trace.Store) callbacks.Handler {
	var mu sync.Mutex
	startedAt := make(map[string]time.Time)

	builder := callbacks.NewHandlerBuilder()
	builder.OnStartFn(func(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
		traceID := trace.TraceID(ctx)
		if traceID == "" || store == nil {
			return ctx
		}

		step := stepFromStart(info, input)
		mu.Lock()
		startedAt[step.ID] = time.Now()
		mu.Unlock()

		store.UpsertStep(traceID, step)
		emitTrace(ctx, traceID, step)
		return ctx
	})
	builder.OnEndFn(func(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
		traceID := trace.TraceID(ctx)
		if traceID == "" || store == nil {
			return ctx
		}

		step := stepFromEnd(info, output, duration(info, startedAt, &mu))
		store.UpsertStep(traceID, step)
		emitTrace(ctx, traceID, step)
		return ctx
	})
	builder.OnEndWithStreamOutputFn(func(ctx context.Context, info *callbacks.RunInfo, _ *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
		traceID := trace.TraceID(ctx)
		if traceID == "" || store == nil {
			return ctx
		}

		step := stepFromEnd(info, nil, duration(info, startedAt, &mu))
		store.UpsertStep(traceID, step)
		emitTrace(ctx, traceID, step)
		return ctx
	})
	builder.OnErrorFn(func(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
		traceID := trace.TraceID(ctx)
		if traceID == "" || store == nil {
			return ctx
		}

		step := baseStep(info)
		step.Status = trace.StatusError
		step.Result = safeText(err.Error(), 160)
		step.DurationMs = duration(info, startedAt, &mu)
		store.UpsertStep(traceID, step)
		emitTrace(ctx, traceID, step)
		return ctx
	})
	return builder.Build()
}

func emitTrace(ctx context.Context, traceID string, step trace.Step) {
	if sink := trace.Sink(ctx); sink != nil {
		sink(trace.Event{TraceID: traceID, Step: step})
	}
}

func duration(info *callbacks.RunInfo, startedAt map[string]time.Time, mu *sync.Mutex) int64 {
	key := stepID(info)
	mu.Lock()
	defer mu.Unlock()
	start, ok := startedAt[key]
	if !ok {
		return 0
	}
	delete(startedAt, key)
	return time.Since(start).Milliseconds()
}

func stepFromStart(info *callbacks.RunInfo, input callbacks.CallbackInput) trace.Step {
	step := baseStep(info)
	step.Status = trace.StatusRunning

	if in := retriever.ConvCallbackInput(input); in != nil {
		step.Description = "检索知识库上下文"
		step.Evidence = []string{fmt.Sprintf("检索查询长度 %d 字符", len(in.Query))}
	}
	if in := tool.ConvCallbackInput(input); in != nil {
		step.ToolName = displayName(info)
		step.Description = "调用外部工具获取运行态证据"
		if in.ArgumentsInJSON != "" {
			step.Evidence = []string{fmt.Sprintf("工具参数摘要：%s", safeText(in.ArgumentsInJSON, 96))}
		}
	}
	if in := model.ConvCallbackInput(input); in != nil {
		step.Description = "调用模型进行推理和响应组织"
		step.Evidence = []string{fmt.Sprintf("模型输入消息 %d 条", len(in.Messages))}
	}
	return step
}

func stepFromEnd(info *callbacks.RunInfo, output callbacks.CallbackOutput, durationMs int64) trace.Step {
	step := baseStep(info)
	step.Status = trace.StatusCompleted
	step.DurationMs = durationMs

	if out := retriever.ConvCallbackOutput(output); out != nil {
		step.Result = fmt.Sprintf("知识库返回 %d 条候选文档", len(out.Docs))
		step.Evidence = documentEvidence(out)
	}
	if out := tool.ConvCallbackOutput(output); out != nil {
		step.ToolName = displayName(info)
		step.Result = fmt.Sprintf("工具返回摘要：%s", safeText(out.Response, 120))
	}
	if out := model.ConvCallbackOutput(output); out != nil {
		step.Result = "模型阶段完成"
		if out.TokenUsage != nil {
			step.Evidence = []string{fmt.Sprintf("token 用量：prompt=%d completion=%d total=%d", out.TokenUsage.PromptTokens, out.TokenUsage.CompletionTokens, out.TokenUsage.TotalTokens)}
		}
	}
	if step.Result == "" {
		step.Result = "阶段执行完成"
	}
	return step
}

func baseStep(info *callbacks.RunInfo) trace.Step {
	name := displayName(info)
	phase := phaseOf(info)
	step := trace.Step{
		ID:        stepID(info),
		Title:     titleOf(name, phase),
		Status:    trace.StatusPending,
		Phase:     phase,
		RiskLevel: riskOf(phase),
	}
	if phase == trace.PhaseObserve {
		step.ToolName = name
	}
	return step
}

func stepID(info *callbacks.RunInfo) string {
	name := strings.ToLower(displayName(info))
	name = strings.NewReplacer(" ", "-", "_", "-", ".", "-", "/", "-").Replace(name)
	if name == "" {
		name = "step"
	}
	return name
}

func displayName(info *callbacks.RunInfo) string {
	if info == nil {
		return "AgentStep"
	}
	if info.Name != "" {
		return info.Name
	}
	if info.Type != "" {
		return info.Type
	}
	return fmt.Sprint(info.Component)
}

func phaseOf(info *callbacks.RunInfo) trace.StepPhase {
	name := strings.ToLower(displayName(info))
	component := ""
	if info != nil {
		component = strings.ToLower(fmt.Sprint(info.Component))
	}
	switch {
	case strings.Contains(name, "rag") || strings.Contains(name, "user-message"):
		return trace.PhaseUnderstand
	case strings.Contains(name, "retriever") || strings.Contains(name, "internal_docs") || strings.Contains(name, "docs"):
		return trace.PhaseRetrieve
	case strings.Contains(component, "tool") || strings.Contains(name, "tool") || strings.Contains(name, "prometheus") || strings.Contains(name, "log") || strings.Contains(name, "mysql") || strings.Contains(name, "time"):
		return trace.PhaseObserve
	case strings.Contains(name, "react") || strings.Contains(name, "model") || strings.Contains(component, "model"):
		return trace.PhaseReason
	default:
		return trace.PhaseReason
	}
}

func titleOf(name string, phase trace.StepPhase) string {
	switch phase {
	case trace.PhaseUnderstand:
		return "理解任务意图"
	case trace.PhaseRetrieve:
		return "检索知识库"
	case trace.PhaseObserve:
		return "查询运行态信号"
	case trace.PhaseReason:
		return "风险研判与归因"
	case trace.PhaseRespond:
		return "生成处置建议"
	default:
		return name
	}
}

func riskOf(phase trace.StepPhase) trace.RiskLevel {
	switch phase {
	case trace.PhaseReason:
		return trace.RiskHigh
	case trace.PhaseRetrieve, trace.PhaseObserve:
		return trace.RiskMedium
	default:
		return trace.RiskLow
	}
}

func documentEvidence(out *retriever.CallbackOutput) []string {
	if out == nil || len(out.Docs) == 0 {
		return []string{"未召回可用知识库文档"}
	}
	limit := len(out.Docs)
	if limit > 3 {
		limit = 3
	}
	items := make([]string, 0, limit)
	for i := 0; i < limit; i++ {
		doc := out.Docs[i]
		if doc == nil {
			continue
		}
		source := doc.ID
		if source == "" {
			source = "知识库文档"
		}
		items = append(items, fmt.Sprintf("%s：%s", source, safeText(doc.Content, 72)))
	}
	return items
}

func safeText(value string, limit int) string {
	value = strings.TrimSpace(strings.Join(strings.Fields(value), " "))
	if value == "" {
		return "无可展示摘要"
	}
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit]) + "..."
}
