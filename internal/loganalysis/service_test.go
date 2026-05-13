package loganalysis

import (
	"strings"
	"testing"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
)

func TestNormalizeRequestDefaults(t *testing.T) {
	req, err := normalizeRequest(Request{
		Region:  "ap-guangzhou",
		TopicID: "topic-1",
		Query:   "error",
	})
	if err != nil {
		t.Fatalf("normalizeRequest returned error: %v", err)
	}
	if req.Limit != DefaultLimit {
		t.Fatalf("expected default limit %d, got %d", DefaultLimit, req.Limit)
	}
	if req.StartTime.IsZero() || req.EndTime.IsZero() {
		t.Fatalf("expected default time range to be set")
	}
	if got := req.EndTime.Sub(req.StartTime); got < 59*time.Minute || got > 61*time.Minute {
		t.Fatalf("expected roughly 1h default range, got %s", got)
	}
}

func TestNormalizeRequestCapsLimit(t *testing.T) {
	req, err := normalizeRequest(Request{
		Region:  "ap-guangzhou",
		TopicID: "topic-1",
		Query:   "panic",
		Limit:   MaxLimit + 100,
	})
	if err != nil {
		t.Fatalf("normalizeRequest returned error: %v", err)
	}
	if req.Limit != MaxLimit {
		t.Fatalf("expected capped limit %d, got %d", MaxLimit, req.Limit)
	}
}

func TestNormalizeRequestValidation(t *testing.T) {
	cases := []Request{
		{TopicID: "topic-1", Query: "error"},
		{Region: "ap-guangzhou", Query: "error"},
		{Region: "ap-guangzhou", TopicID: "topic-1"},
		{
			Region:    "ap-guangzhou",
			TopicID:   "topic-1",
			Query:     "error",
			StartTime: time.Now(),
			EndTime:   time.Now().Add(-time.Minute),
		},
	}
	for _, tc := range cases {
		if _, err := normalizeRequest(tc); err == nil {
			t.Fatalf("expected validation error for %#v", tc)
		}
	}
}

func TestSelectLogTool(t *testing.T) {
	tool, ok := selectLogTool([]mcp.Tool{
		{Name: "search_metrics", Description: "metrics"},
		{Name: "query_log", Description: "query cls logs"},
	})
	if !ok || tool.Name != "query_log" {
		t.Fatalf("expected query_log, got %q ok=%v", tool.Name, ok)
	}

	tool, ok = selectLogTool([]mcp.Tool{
		{Name: "search", Description: "检索日志内容"},
	})
	if !ok || tool.Name != "search" {
		t.Fatalf("expected description match, got %q ok=%v", tool.Name, ok)
	}
}

func TestBuildToolArgumentsUsesSchemaNames(t *testing.T) {
	args := buildToolArguments(mcp.Tool{
		InputSchema: mcp.ToolInputSchema{
			Properties: map[string]any{
				"Region":    map[string]any{"type": "string"},
				"TopicId":   map[string]any{"type": "string"},
				"Query":     map[string]any{"type": "string"},
				"StartTime": map[string]any{"type": "integer"},
				"EndTime":   map[string]any{"type": "integer"},
				"Limit":     map[string]any{"type": "string"},
			},
		},
	}, Request{
		Region:    "ap-guangzhou",
		TopicID:   "topic-1",
		Query:     "error",
		StartTime: time.Unix(10, 0),
		EndTime:   time.Unix(20, 0),
		Limit:     50,
	})
	if args["Region"] != "ap-guangzhou" || args["TopicId"] != "topic-1" || args["Query"] != "error" {
		t.Fatalf("unexpected string args: %#v", args)
	}
	if args["StartTime"] != int64(10) || args["EndTime"] != int64(20) {
		t.Fatalf("unexpected time args: %#v", args)
	}
	if args["Limit"] != "50" {
		t.Fatalf("expected string limit, got %#v", args["Limit"])
	}
}

func TestSummarizeLogsEmptyResult(t *testing.T) {
	report, err := summarizeLogs(nil, Request{}, "")
	if err != nil {
		t.Fatalf("summarizeLogs returned error: %v", err)
	}
	if !strings.Contains(report.Summary, "未查询到") {
		t.Fatalf("unexpected summary: %s", report.Summary)
	}
	if len(report.Suggestions) == 0 {
		t.Fatalf("expected suggestions for empty result")
	}
}
