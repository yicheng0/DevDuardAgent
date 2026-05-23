import ConfigPanel from '@/components/config/ConfigPanel';
import { useUIStore } from '@/stores/uiStore';

const ConfigDialog = () => {
  const { isConfigOpen, setConfigOpen } = useUIStore();

  if (!isConfigOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="app-surface flex max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_60px_rgba(3,8,20,0.4)]">
        <ConfigPanel variant="dialog" onClose={() => setConfigOpen(false)} />
      </div>
    </div>
  );
};

export default ConfigDialog;
