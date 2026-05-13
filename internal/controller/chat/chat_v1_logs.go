package chat

import (
	"context"
	"time"

	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/loganalysis"
)

func (c *ControllerV1) LogAnalyze(ctx context.Context, req *v1.LogAnalyzeReq) (res *v1.LogAnalyzeRes, err error) {
	startTime, err := parseOptionalLogTime(req.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := parseOptionalLogTime(req.EndTime)
	if err != nil {
		return nil, err
	}
	result, err := loganalysis.NewService().Analyze(ctx, loganalysis.Request{
		Region:    req.Region,
		TopicID:   req.TopicID,
		Query:     req.Query,
		StartTime: startTime,
		EndTime:   endTime,
		Limit:     req.Limit,
	})
	if err != nil {
		return nil, err
	}
	samples := make([]v1.LogSample, 0, len(result.Samples))
	for _, sample := range result.Samples {
		samples = append(samples, v1.LogSample{
			Timestamp: sample.Timestamp,
			Level:     sample.Level,
			Message:   sample.Message,
		})
	}
	return &v1.LogAnalyzeRes{
		Summary:     result.Summary,
		Patterns:    result.Patterns,
		Samples:     samples,
		Suggestions: result.Suggestions,
		RawResult:   result.RawResult,
		ToolName:    result.ToolName,
		ResultCount: result.ResultCount,
		StartedAt:   result.StartedAt,
		EndedAt:     result.EndedAt,
		DurationMs:  result.DurationMs,
	}, nil
}

func parseOptionalLogTime(raw string) (time.Time, error) {
	if raw == "" {
		return time.Time{}, nil
	}
	return time.Parse(time.RFC3339, raw)
}
