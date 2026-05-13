import { FileSearch } from 'lucide-react';

interface EvidenceCardProps {
  items?: string[];
}

export const EvidenceCard = ({ items = [] }: EvidenceCardProps) => {
  if (!items.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-[#ead7b7] bg-[#fff6e8] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#7f432f]">
        <FileSearch className="h-3.5 w-3.5" />
        Evidence
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-5 text-[#5f4b3d]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a563f]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
