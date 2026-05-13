import { create } from 'zustand';
import { AgentTraceEvent, AIOpsResult, AIOpsStep } from '@/types';

interface AIOpsStore {
  result: AIOpsResult | null;
  isRunning: boolean;

  // Actions
  setResult: (result: AIOpsResult) => void;
  updateStep: (stepId: string, updates: Partial<AIOpsStep>) => void;
  applyTraceEvent: (event: AgentTraceEvent) => void;
  setRunning: (isRunning: boolean) => void;
  startDemoTrace: (prompt: string, hasFile?: boolean) => void;
  completeTrace: (summary?: string) => void;
  failTrace: (message?: string) => void;
  reset: () => void;
}

const traceTimers: number[] = [];

const clearTraceTimers = () => {
  traceTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
};

const buildDemoSteps = (prompt: string, hasFile?: boolean): AIOpsStep[] => {
  const subject = prompt.trim().slice(0, 36) || '当前安全任务';

  return [
    {
      id: 'understand',
      phase: 'understand',
      title: '理解任务意图',
      status: 'pending',
      description: `识别用户目标：“${subject}${prompt.length > 36 ? '...' : ''}”`,
      evidence: ['抽取安全对象、期望动作和输出格式', '判断是否需要进入告警处置链路'],
      durationMs: 420,
      riskLevel: 'low',
    },
    {
      id: 'retrieve',
      phase: 'retrieve',
      title: hasFile ? '解析上传材料' : '检索知识库',
      status: 'pending',
      toolName: hasFile ? 'file_analyzer' : 'query_internal_docs',
      description: hasFile
        ? '读取上传文件，提取关键日志、配置和可疑片段'
        : '召回告警处理手册、历史处置经验和安全基线',
      evidence: hasFile
        ? ['发现上传附件，优先进行内容抽取', '准备将附件证据并入回答上下文']
        : ['匹配告警处理手册中的相似条目', '补充常见误报和升级条件'],
      durationMs: 760,
      riskLevel: 'medium',
    },
    {
      id: 'observe',
      phase: 'observe',
      title: '查询运行态信号',
      status: 'pending',
      toolName: 'query_metrics_alerts',
      description: '模拟拉取指标、日志和当前告警上下文',
      evidence: ['检查服务健康状态、错误率和最近告警', '定位可能影响范围和优先级'],
      durationMs: 680,
      riskLevel: 'medium',
    },
    {
      id: 'reason',
      phase: 'reason',
      title: '风险研判与归因',
      status: 'pending',
      description: '综合证据判断风险等级、根因假设和处置路径',
      evidence: ['按影响面、可恢复性和置信度排序', '生成可执行的处置步骤'],
      durationMs: 910,
      riskLevel: 'high',
    },
    {
      id: 'respond',
      phase: 'respond',
      title: '生成处置建议',
      status: 'pending',
      description: '输出面向运维人员的结论、操作步骤和复盘建议',
      evidence: ['组织最终答复结构', '标注需要人工确认的高风险操作'],
      durationMs: 540,
      riskLevel: 'low',
    },
  ];
};

export const useAIOpsStore = create<AIOpsStore>((set) => ({
  result: null,
  isRunning: false,

  setResult: (result) => set({ result }),

  updateStep: (stepId, updates) =>
    set((state) => {
      if (!state.result) return state;
      return {
        result: {
          ...state.result,
          steps: state.result.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        },
      };
    }),

  applyTraceEvent: (event) =>
    set((state) => {
      const currentSteps = state.result?.traceId === event.traceId ? state.result.steps : [];
      const exists = currentSteps.some((step) => step.id === event.step.id);
      const steps = exists
        ? currentSteps.map((step) =>
            step.id === event.step.id ? { ...step, ...event.step } : step
          )
        : [...currentSteps, event.step];

      return {
        isRunning: event.step.status === 'completed' ? state.isRunning : true,
        result: {
          ...state.result,
          traceId: event.traceId,
          steps,
        },
      };
    }),

  setRunning: (isRunning) => set({ isRunning }),

  startDemoTrace: (prompt, hasFile = false) => {
    clearTraceTimers();
    const steps = buildDemoSteps(prompt, hasFile);
    set({ result: { steps }, isRunning: true });

    steps.forEach((step, index) => {
      const startDelay = index * 850;
      const completeDelay = startDelay + (step.durationMs || 650);

      traceTimers.push(
        window.setTimeout(() => {
          set((state) => ({
            result: state.result
              ? {
                  ...state.result,
                  steps: state.result.steps.map((item) =>
                    item.id === step.id ? { ...item, status: 'running' } : item
                  ),
                }
              : state.result,
          }));
        }, startDelay)
      );

      traceTimers.push(
        window.setTimeout(() => {
          set((state) => ({
            result: state.result
              ? {
                  ...state.result,
                  steps: state.result.steps.map((item) =>
                    item.id === step.id
                      ? {
                          ...item,
                          status: 'completed',
                          result:
                            item.result ||
                            (item.toolName
                              ? `${item.toolName} 已返回可用上下文`
                              : '阶段分析完成'),
                        }
                      : item
                  ),
                }
              : state.result,
          }));
        }, completeDelay)
      );
    });
  },

  completeTrace: (summary) => {
    clearTraceTimers();
    set((state) => {
      if (!state.result) return { isRunning: false };

      return {
        isRunning: false,
        result: {
          steps: state.result.steps.map((step) => ({
            ...step,
            status: step.status === 'error' ? step.status : 'completed',
            result:
              step.result ||
              (step.toolName ? `${step.toolName} 已返回可用上下文` : '阶段分析完成'),
          })),
          finalReport:
            summary ||
            'Agent 已完成任务理解、证据检索、运行态分析和处置建议生成。',
        },
      };
    });
  },

  failTrace: (message = 'Agent 执行链路异常，请稍后重试。') => {
    clearTraceTimers();
    set((state) => {
      if (!state.result) return { isRunning: false };
      const hasRunning = state.result.steps.some((step) => step.status === 'running');
      let marked = false;

      return {
        isRunning: false,
        result: {
          ...state.result,
          steps: state.result.steps.map((step) => {
            if (!marked && (step.status === 'running' || (!hasRunning && step.status === 'pending'))) {
              marked = true;
              return { ...step, status: 'error', result: message };
            }
            return step;
          }),
          finalReport: message,
        },
      };
    });
  },

  reset: () => {
    clearTraceTimers();
    set({ result: null, isRunning: false });
  },
}));
