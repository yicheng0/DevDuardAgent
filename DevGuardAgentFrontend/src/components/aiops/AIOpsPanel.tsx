import { GlassCard } from '@/components/ui/GlassCard';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader, XCircle, Clock, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const AIOpsPanel = () => {
  const { result, isRunning } = useAIOpsStore();
  const { isAIOpsOpen, toggleAIOps } = useUIStore();

  if (!isAIOpsOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-glow-green" />;
      case 'running':
        return (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Loader className="w-5 h-5 text-glow-blue" />
          </motion.div>
        );
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-glow-green/50 shadow-glow-green';
      case 'running':
        return 'border-glow-blue/50 shadow-glow animate-glow-pulse';
      case 'error':
        return 'border-red-500/50 shadow-glow-pink';
      default:
        return 'border-white/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-[400px] glass-dark border-l border-white/10 z-40 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">AI Ops 分析</h2>
            <button
              onClick={toggleAIOps}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          {!result && !isRunning ? (
            <div className="text-center py-12">
              <p className="text-slate-400">暂无分析结果</p>
              <p className="text-slate-500 text-sm mt-2">点击顶部 AI Ops 按钮开始分析</p>
            </div>
          ) : (
            <div className="space-y-4">
              {result?.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard
                    variant="elevated"
                    className={`p-4 ${getStatusClass(step.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium mb-1">{step.title}</h3>
                        {step.description && (
                          <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                        )}
                        {step.result && (
                          <div className="mt-2 p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">
                              {step.result}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}

              {/* Final Report */}
              {result?.finalReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard variant="glow" className="p-4">
                    <h3 className="text-white font-medium mb-3">分析报告</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-slate-300 whitespace-pre-wrap">{result.finalReport}</p>
                    </div>
                  </GlassCard>
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
