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
  pending: 'border-slate-700 bg-slate-900 text-slate-400',
  running: 'border-[#d9a08a] bg-[#f7ebe5] text-[#7f432f] shadow-[0_0_0_4px_rgba(154,86,63,0.12)]',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  error: 'border-red-300 bg-red-50 text-red-700',
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
    <div className="relative space-y-3">
      <div className="absolute left-4 top-5 h-[calc(100%-40px)] w-px bg-slate-700" />
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="relative flex gap-3"
        >
          <div
            className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${statusClass[step.status]}`}
          >
            {getStatusIcon(step)}
          </div>

          <div
            className={`min-w-0 flex-1 rounded-lg border p-3 transition-colors ${
              step.status === 'running'
                ? 'border-[#d9a08a] bg-[#f7ebe5]'
                : 'border-slate-700 bg-slate-900/85'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-sm font-semibold ${step.status === 'running' ? 'text-[#3f2116]' : 'text-white'}`}>
                    {step.title}
                  </h3>
                  <RiskBadge level={step.riskLevel} />
                </div>
                {step.description && (
                  <p className={`mt-1 text-sm leading-5 ${step.status === 'running' ? 'text-[#6f3b2a]' : 'text-slate-300'}`}>
                    {step.description}
                  </p>
                )}
              </div>
              {step.durationMs && (
                <span
                  className={`rounded-md border px-2 py-1 text-xs ${
                    step.status === 'running'
                      ? 'border-[#d9a08a] bg-white/70 text-[#7f432f]'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  {(step.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>

            {step.toolName && (
              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                  step.status === 'running'
                    ? 'border-[#d9a08a] bg-white/70 text-[#7f432f]'
                    : 'border-[#d9a08a]/40 bg-[#9a563f]/15 text-[#f3c7b4]'
                }`}
              >
                <FileSearch className="h-3.5 w-3.5" />
                {step.toolName}
              </div>
            )}

            <EvidenceCard items={step.evidence} />

            {step.result && (
              <p
                className={`mt-3 rounded-md px-3 py-2 text-sm leading-5 ${
                  step.status === 'running'
                    ? 'bg-white/70 text-[#4f281b]'
                    : 'bg-slate-950/80 text-slate-200'
                }`}
              >
                {step.result}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
