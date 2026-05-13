package loganalysis

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"SuperBizAgent/internal/ai/models"

	"github.com/cloudwego/eino/schema"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/mark3labs/mcp-go/client"
	"github.com/mark3labs/mcp-go/mcp"
)

const (
	DefaultLimit = 100
	MaxLimit     = 500
)

type Request struct {
	Region    string
	TopicID   string
	Query     string
	StartTime time.Time
	EndTime   time.Time
	Limit     int
}

type Response struct {
	Summary     string      `json:"summary"`
	Patterns    []string    `json:"patterns"`
	Samples     []LogSample `json:"samples"`
	Suggestions []string    `json:"suggestions"`
	RawResult   string      `json:"rawResult"`
	ToolName    string      `json:"toolName"`
	ResultCount int         `json:"resultCount"`
	StartedAt   string      `json:"startedAt"`
	EndedAt     string      `json:"endedAt"`
	DurationMs  int64       `json:"durationMs"`
}

type LogSample struct {
	Timestamp string `json:"timestamp,omitempty"`
	Level     string `json:"level,omitempty"`
	Message   string `json:"message"`
}

type analysisJSON struct {
	Summary     string      `json:"summary"`
	Patterns    []string    `json:"patterns"`
	Samples     []LogSample `json:"samples"`
	Suggestions []string    `json:"suggestions"`
}

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Analyze(ctx context.Context, in Request) (*Response, error) {
	req, err := normalizeRequest(in)
	if err != nil {
		return nil, err
	}
	started := time.Now()
	toolName, raw, err := queryMCPLogs(ctx, req)
	if err != nil {
		return nil, err
	}
	report, err := summarizeLogs(ctx, req, raw)
	if err != nil {
		return nil, err
	}
	if len(report.Samples) == 0 {
		report.Samples = sampleLines(raw, 5)
	}
	if report.Summary == "" {
		report.Summary = "日志查询已完成，但模型未返回摘要。请查看原始结果确认异常上下文。"
	}
	return &Response{
		Summary:     report.Summary,
		Patterns:    report.Patterns,
		Samples:     report.Samples,
		Suggestions: report.Suggestions,
		RawResult:   raw,
		ToolName:    toolName,
		ResultCount: estimateResultCount(raw),
		StartedAt:   req.StartTime.Format(time.RFC3339),
		EndedAt:     req.EndTime.Format(time.RFC3339),
		DurationMs:  time.Since(started).Milliseconds(),
	}, nil
}

func normalizeRequest(in Request) (Request, error) {
	out := in
	out.Region = strings.TrimSpace(out.Region)
	out.TopicID = strings.TrimSpace(out.TopicID)
	out.Query = strings.TrimSpace(out.Query)
	if out.Region == "" {
		return out, fmt.Errorf("地域不能为空")
	}
	if out.TopicID == "" {
		return out, fmt.Errorf("日志主题ID不能为空")
	}
	if out.Query == "" {
		return out, fmt.Errorf("查询语句不能为空")
	}
	if out.EndTime.IsZero() {
		out.EndTime = time.Now()
	}
	if out.StartTime.IsZero() {
		out.StartTime = out.EndTime.Add(-time.Hour)
	}
	if !out.StartTime.Before(out.EndTime) {
		return out, fmt.Errorf("开始时间必须早于结束时间")
	}
	if out.Limit <= 0 {
		out.Limit = DefaultLimit
	}
	if out.Limit > MaxLimit {
		out.Limit = MaxLimit
	}
	return out, nil
}

func queryMCPLogs(ctx context.Context, req Request) (string, string, error) {
	mcpURL, err := g.Cfg().Get(ctx, "mcp_url")
	if err != nil {
		return "", "", err
	}
	if strings.TrimSpace(mcpURL.String()) == "" {
		return "", "", fmt.Errorf("MCP URL未配置")
	}
	cli, err := client.NewSSEMCPClient(mcpURL.String())
	if err != nil {
		return "", "", err
	}
	defer cli.Close()
	if err = cli.Start(ctx); err != nil {
		return "", "", err
	}
	initRequest := mcp.InitializeRequest{}
	initRequest.Params.ProtocolVersion = mcp.LATEST_PROTOCOL_VERSION
	initRequest.Params.ClientInfo = mcp.Implementation{
		Name:    "devguard-log-analysis",
		Version: "1.0.0",
	}
	if _, err = cli.Initialize(ctx, initRequest); err != nil {
		return "", "", err
	}
	tools, err := cli.ListTools(ctx, mcp.ListToolsRequest{})
	if err != nil {
		return "", "", err
	}
	selected, ok := selectLogTool(tools.Tools)
	if !ok {
		return "", "", fmt.Errorf("MCP服务未暴露日志查询工具")
	}
	result, err := cli.CallTool(ctx, mcp.CallToolRequest{
		Request: mcp.Request{Method: "tools/call"},
		Params: mcp.CallToolParams{
			Name:      selected.Name,
			Arguments: buildToolArguments(selected, req),
		},
	})
	if err != nil {
		return "", "", err
	}
	raw := stringifyToolResult(result)
	if result.IsError {
		return "", "", fmt.Errorf("日志工具调用失败: %s", raw)
	}
	return selected.Name, raw, nil
}

func selectLogTool(tools []mcp.Tool) (mcp.Tool, bool) {
	if len(tools) == 0 {
		return mcp.Tool{}, false
	}
	for _, t := range tools {
		if normalizeName(t.Name) == "querylog" {
			return t, true
		}
	}
	for _, t := range tools {
		name := normalizeName(t.Name)
		desc := strings.ToLower(t.Description)
		if strings.Contains(name, "log") || strings.Contains(desc, "log") || strings.Contains(desc, "日志") {
			return t, true
		}
	}
	return mcp.Tool{}, false
}

func buildToolArguments(t mcp.Tool, req Request) map[string]any {
	props := t.InputSchema.Properties
	if len(props) == 0 {
		return map[string]any{
			"region":     req.Region,
			"topic_id":   req.TopicID,
			"query":      req.Query,
			"start_time": req.StartTime.Format(time.RFC3339),
			"end_time":   req.EndTime.Format(time.RFC3339),
			"limit":      req.Limit,
		}
	}
	args := make(map[string]any)
	for name, prop := range props {
		kind := classifyField(name)
		if kind == "" {
			continue
		}
		args[name] = formatFieldValue(kind, propType(prop), req)
	}
	return args
}

func classifyField(name string) string {
	n := normalizeName(name)
	switch {
	case n == "region" || n == "regionid" || n == "clsregion":
		return "region"
	case n == "topicid" || n == "topic" || n == "logtopicid" || n == "logtopic":
		return "topic"
	case n == "query" || n == "querystring" || n == "searchquery" || n == "keyword" || n == "keywords":
		return "query"
	case n == "starttime" || n == "begintime" || n == "from" || n == "fromtime" || n == "start":
		return "start"
	case n == "endtime" || n == "stoptime" || n == "to" || n == "totime" || n == "end":
		return "end"
	case n == "limit" || n == "count" || n == "maxresults" || n == "pagesize" || n == "maxlognum":
		return "limit"
	default:
		return ""
	}
}

func formatFieldValue(kind, typ string, req Request) any {
	switch kind {
	case "region":
		return req.Region
	case "topic":
		return req.TopicID
	case "query":
		return req.Query
	case "start":
		return formatTimeForTool(req.StartTime, typ)
	case "end":
		return formatTimeForTool(req.EndTime, typ)
	case "limit":
		if typ == "string" {
			return strconv.Itoa(req.Limit)
		}
		return req.Limit
	default:
		return ""
	}
}

func formatTimeForTool(t time.Time, typ string) any {
	if typ == "integer" || typ == "number" {
		return t.Unix()
	}
	return t.Format(time.RFC3339)
}

func propType(prop any) string {
	m, ok := prop.(map[string]any)
	if !ok {
		return ""
	}
	if typ, ok := m["type"].(string); ok {
		return typ
	}
	return ""
}

func normalizeName(in string) string {
	replacer := strings.NewReplacer("_", "", "-", "", ".", "")
	return strings.ToLower(replacer.Replace(strings.TrimSpace(in)))
}

func stringifyToolResult(result *mcp.CallToolResult) string {
	if result == nil {
		return ""
	}
	parts := make([]string, 0, len(result.Content)+1)
	for _, content := range result.Content {
		switch v := content.(type) {
		case mcp.TextContent:
			if strings.TrimSpace(v.Text) != "" {
				parts = append(parts, v.Text)
			}
		default:
			if b, err := json.Marshal(v); err == nil {
				parts = append(parts, string(b))
			}
		}
	}
	if result.StructuredContent != nil {
		if b, err := json.Marshal(result.StructuredContent); err == nil {
			parts = append(parts, string(b))
		}
	}
	if len(parts) > 0 {
		return strings.Join(parts, "\n")
	}
	b, err := json.Marshal(result)
	if err != nil {
		return fmt.Sprintf("%v", result)
	}
	return string(b)
}

func summarizeLogs(ctx context.Context, req Request, raw string) (analysisJSON, error) {
	if strings.TrimSpace(raw) == "" {
		return analysisJSON{
			Summary:     "未查询到匹配日志。",
			Patterns:    []string{},
			Samples:     []LogSample{},
			Suggestions: []string{"扩大时间范围或放宽关键词后重试。", "确认地域和日志主题ID是否正确。"},
		}, nil
	}
	cm, err := models.OpenAIForDeepSeekV3Quick(ctx)
	if err != nil {
		return analysisJSON{}, err
	}
	prompt := fmt.Sprintf(`请基于以下日志查询结果输出严格 JSON，不要输出 Markdown，不要引入日志之外的外部知识。
JSON 结构：
{
  "summary": "一句到三句话的中文摘要",
  "patterns": ["异常模式或关键发现"],
  "samples": [{"timestamp":"可选时间","level":"可选级别","message":"关键日志样例"}],
  "suggestions": ["下一步排查建议"]
}

查询条件：
- region: %s
- topicId: %s
- query: %s
- startTime: %s
- endTime: %s
- limit: %d

日志结果：
%s`, req.Region, req.TopicID, req.Query, req.StartTime.Format(time.RFC3339), req.EndTime.Format(time.RFC3339), req.Limit, truncate(raw, 12000))
	msg, err := cm.Generate(ctx, []*schema.Message{
		schema.SystemMessage("你是严谨的 AIOps 日志分析助手，只能根据输入日志给出结论。"),
		schema.UserMessage(prompt),
	})
	if err != nil {
		return analysisJSON{}, err
	}
	report, err := parseAnalysisJSON(msg.Content)
	if err != nil {
		return analysisJSON{
			Summary:     msg.Content,
			Patterns:    []string{},
			Samples:     sampleLines(raw, 5),
			Suggestions: []string{"查看原始日志结果，确认模型摘要中的关键结论。"},
		}, nil
	}
	return report, nil
}

func parseAnalysisJSON(content string) (analysisJSON, error) {
	var out analysisJSON
	text := strings.TrimSpace(content)
	if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSuffix(text, "```")
		text = strings.TrimSpace(text)
	}
	if err := json.Unmarshal([]byte(text), &out); err != nil {
		return out, err
	}
	return out, nil
}

func sampleLines(raw string, limit int) []LogSample {
	lines := strings.Split(raw, "\n")
	samples := make([]LogSample, 0, limit)
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || line == "[]" || line == "{}" {
			continue
		}
		samples = append(samples, LogSample{Message: truncate(line, 800)})
		if len(samples) >= limit {
			break
		}
	}
	return samples
}

func estimateResultCount(raw string) int {
	if strings.TrimSpace(raw) == "" {
		return 0
	}
	keys := []string{"\"logs\"", "\"results\"", "\"items\"", "\"records\""}
	for _, key := range keys {
		if strings.Contains(raw, key) {
			return strings.Count(raw, "\"time\"") + strings.Count(raw, "\"timestamp\"")
		}
	}
	lines := strings.Split(strings.TrimSpace(raw), "\n")
	count := 0
	for _, line := range lines {
		if strings.TrimSpace(line) != "" {
			count++
		}
	}
	return count
}

func truncate(in string, max int) string {
	if len(in) <= max {
		return in
	}
	return in[:max] + "\n...[truncated]"
}
