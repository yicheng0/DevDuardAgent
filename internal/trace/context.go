package trace

import "context"

type contextKey string

const (
	traceIDKey contextKey = "agent_trace_id"
	sessionKey contextKey = "agent_trace_session_id"
	sinkKey    contextKey = "agent_trace_sink"
)

func WithRun(ctx context.Context, sessionID, traceID string, sink EventSink) context.Context {
	ctx = context.WithValue(ctx, sessionKey, sessionID)
	ctx = context.WithValue(ctx, traceIDKey, traceID)
	if sink != nil {
		ctx = context.WithValue(ctx, sinkKey, sink)
	}
	return ctx
}

func TraceID(ctx context.Context) string {
	if v := ctx.Value(traceIDKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func SessionID(ctx context.Context) string {
	if v := ctx.Value(sessionKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func Sink(ctx context.Context) EventSink {
	if v := ctx.Value(sinkKey); v != nil {
		if sink, ok := v.(EventSink); ok {
			return sink
		}
	}
	return nil
}
