import { AIOpsStep } from '@/types';
import { motion } from 'framer-motion';
import {
  Brain,
  Check,
  CircleDashed,
  Database,
  FileSearch,
  Loader2,
  MessageSquareText,
  Radar,
  TriangleAlert,
  X,
} from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { RiskBadge } from './RiskBadge';

interface TraceTimelineProps {
  steps: AIOpsStep[];
}

const phaseIcon = {
  understand: Brain,
  retrieve: Database,
  observe: Radar,
  reason: TriangleAlert,
  respond: MessageSquareText,
};

const statusClass = {
  pending: 'border-white/10 bg-white/5 text-slate-500',
  running: 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.22)]',
  completed: 'border-emerald-300/50 bg-emerald-300/10 text-emerald-100',
  error: 'border-red-300/60 bg-red-300/10 text-red-100',
};

const getStatusIcon = (step: AIOpsStep) => {
  if (step.status === 'running') {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }
  if (step.status === 'completed') {
    return <Check className="h-4 w-4" />;
  }
  if (step.status === 'error') {
    return <X className="h-4 w-4" />;
  }

  const Icon = step.phase ? phaseIcon[step.phase] : CircleDashed;
  return <Icon className="h-4 w-4" />;
};

export const TraceTimeline = ({ steps }: TraceTimelineProps) => {
  return (
    <div className="relative space-y-4">
      <div className="absolute left-5 top-6 h-[calc(100%-48px)] w-px bg-gradient-to-b from-cyan-300/50 via-white/10 to-transparent" />
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="relative flex gap-3"
        >
          <div
            className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${statusClass[step.status]}`}
          >
            {getStatusIcon(step)}
          </div>

          <div
            className={`min-w-0 flex-1 rounded-xl border p-4 transition-all duration-300 ${
              step.status === 'running'
                ? 'border-cyan-300/30 bg-cyan-950/25'
                : 'border-white/10 bg-white/[0.045]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <RiskBadge level={step.riskLevel} />
                </div>
                {step.description && (
                  <p className="mt-1 text-sm leading-5 text-slate-400">{step.description}</p>
                )}
              </div>
              {step.durationMs && (
                <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-slate-400">
                  {(step.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>

            {step.toolName && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-xs font-medium text-cyan-100">
                <FileSearch className="h-3.5 w-3.5" />
                {step.toolName}
              </div>
            )}

            <EvidenceCard items={step.evidence} />

            {step.result && (
              <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-sm leading-5 text-slate-300">
                {step.result}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
