package chat

import (
	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/ai/agent/plan_execute_replan"
	"context"
	"errors"
	"fmt"
	"time"
)

func (c *ControllerV1) AIOps(ctx context.Context, req *v1.AIOpsReq) (res *v1.AIOpsRes, err error) {
	query := fmt.Sprintf(`
你是一个智能的服务告警分析助手，请严格按以下顺序执行：
1. 调用工具 query_prometheus_alerts 获取当前活跃告警。
2. 对每个告警，调用 query_internal_docs 检索对应处理方案。
3. 如果需要时间参数，先调用 get_current_time，再构造时间范围。
4. 如果需要日志，先调用日志工具，必须携带地域和日志主题。
5. 分析时只允许依据工具返回和内部文档，不允许引入外部知识。
6. 最终输出结构化报告，必须包含：
   - 告警摘要
   - 活跃告警清单
   - 根因分析
   - 处理建议
   - 结论

输出要求：
- 结果要可直接给运维人员执行
- 每条结论都要给出证据来源
- 若工具返回为空，明确写出原因和下一步建议
当前时间：%s
`, time.Now().Format("2006-01-02 15:04:05"))

	resp, detail, err := plan_execute_replan.BuildPlanAgent(ctx, query)
	if err != nil {
		return nil, err
	}
	if resp == "" {
		return nil, errors.New("内部错误")
	}
	res = &v1.AIOpsRes{
		Result: resp,
		Detail: detail,
	}
	return res, nil

}
