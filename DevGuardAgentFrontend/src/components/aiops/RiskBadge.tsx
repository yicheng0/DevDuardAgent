import { AIOpsStep } from '@/types';

interface RiskBadgeProps {
  level?: AIOpsStep['riskLevel'];
}

const riskMap = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-sky-200 bg-sky-50 text-sky-700',
  high: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
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
      className={`inline-flex h-6 items-center rounded-md border px-2 text-xs font-semibold ${riskMap[level]}`}
    >
      {labelMap[level]}
    </span>
  );
};
