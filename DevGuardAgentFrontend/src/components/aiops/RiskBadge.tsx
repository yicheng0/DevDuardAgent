import { AIOpsStep } from '@/types';

interface RiskBadgeProps {
  level?: AIOpsStep['riskLevel'];
}

const riskMap = {
  low: 'border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#c3d7ff]',
  medium: 'border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#c3d7ff]',
  high: 'border-[#7c5cff]/20 bg-[#7c5cff]/10 text-[#d8ccff]',
  critical: 'border-red-400/20 bg-red-400/10 text-red-200',
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
