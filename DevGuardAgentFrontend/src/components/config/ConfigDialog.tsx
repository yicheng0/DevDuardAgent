import ConfigPanel from '@/components/config/ConfigPanel';
import { useUIStore } from '@/stores/uiStore';

const ConfigDialog = () => {
  const { isConfigOpen, setConfigOpen } = useUIStore();

  if (!isConfigOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2116]/35 p-4">
      <div className="app-surface flex max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border shadow-2xl">
        <ConfigPanel variant="dialog" onClose={() => setConfigOpen(false)} />
      </div>
    </div>
  );
};

export default ConfigDialog;
