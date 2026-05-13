import { useAIOpsStore } from '@/stores/aiopsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bot, PanelRightClose, Route, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { TraceTimeline } from './TraceTimeline';

const AIOpsPanel = () => {
  const { result, isRunning } = useAIOpsStore();
  const { isAIOpsOpen, toggleAIOps } = useUIStore();

  if (!isAIOpsOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 z-40 h-full w-full overflow-y-auto border-l border-[#dec39d] bg-[#fff8e8]/95 shadow-[-28px_0_70px_rgba(127,67,47,0.18)] backdrop-blur-2xl sm:w-[440px]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(154,86,63,0.12),transparent_34%),radial-gradient(circle_at_100%_30%,rgba(245,158,11,0.10),transparent_28%)]" />
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d9a08a] bg-[#f7ebe5] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#7f432f]">
                <Route className="h-3.5 w-3.5" />
                Agent Trace
              </div>
              <h2 className="text-xl font-semibold text-[#2f2119]">推理轨迹工作台</h2>
              <p className="mt-1 text-sm text-[#6f5b4b]">任务拆解、工具调用、证据和处置结论</p>
            </div>
            <button
              onClick={toggleAIOps}
              className="brand-focus-ring flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#ead7b7] bg-[#fffdf8] text-[#7f432f] transition-colors hover:border-[#d9a08a] hover:bg-[#f7ebe5]"
              aria-label="关闭推理轨迹面板"
            >
              <PanelRightClose className="h-5 w-5" />
            </button>
          </div>

          {!result && !isRunning ? (
            <div className="rounded-2xl border border-[#ead7b7] bg-[#fffdf8] p-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d9a08a] bg-[#f7ebe5] text-[#7f432f]">
                <Bot className="h-7 w-7" />
              </div>
              <p className="text-base font-medium text-[#2f2119]">等待 Agent 任务</p>
              <p className="mt-2 text-sm leading-6 text-[#6f5b4b]">
                发送一条安全运维问题后，这里会展示 Agent 的理解、检索、观测、研判和响应过程。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#ead7b7] bg-[#fffdf8] p-3">
                  <Activity className="mb-2 h-4 w-4 text-[#9a563f]" />
                  <p className="text-lg font-semibold text-[#2f2119]">
                    {result?.steps.filter((step) => step.status === 'completed').length || 0}/
                    {result?.steps.length || 0}
                  </p>
                  <p className="text-xs text-[#6f5b4b]">完成阶段</p>
                </div>
                <div className="rounded-xl border border-[#ead7b7] bg-[#fffdf8] p-3">
                  <ShieldCheck className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-lg font-semibold text-[#2f2119]">
                    {isRunning ? '运行中' : '已归档'}
                  </p>
                  <p className="text-xs text-[#6f5b4b]">Agent 状态</p>
                </div>
                <div className="rounded-xl border border-[#ead7b7] bg-[#fffdf8] p-3">
                  <Route className="mb-2 h-4 w-4 text-amber-600" />
                  <p className="text-lg font-semibold text-[#2f2119]">
                    {result?.steps.filter((step) => step.toolName).length || 0}
                  </p>
                  <p className="text-xs text-[#6f5b4b]">工具调用</p>
                </div>
              </div>

              {result?.steps && <TraceTimeline steps={result.steps} />}

              {result?.finalReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <h3 className="mb-2 text-sm font-semibold text-emerald-900">最终处置摘要</h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {result.finalReport}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIOpsPanel;
