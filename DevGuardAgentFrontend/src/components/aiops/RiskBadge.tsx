import { AIOpsStep } from '@/types';

interface RiskBadgeProps {
  level?: AIOpsStep['riskLevel'];
}

const riskMap = {
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  medium: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  high: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  critical: 'border-red-400/40 bg-red-400/10 text-red-200',
};

const labelMap = {
  low: '低风险',
  medium: '关注',
  high: '高风险',
  critical: '严重',
};

export const RiskBadge = ({ level = 'low' }: RiskBadgeProps) => {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${riskMap[level]}`}
    >
      {labelMap[level]}
    </span>
  );
};
