import AppLayout from '@/components/layout/AppLayout';
import SettingsPage from '@/components/config/SettingsPage';
import OpsWorkbench from '@/components/ops/OpsWorkbench';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useEffect } from 'react';

function App() {
  const { getCurrentSession, createSession } = useChatStore();
  const { activeNav } = useUIStore();
  const session = getCurrentSession();

  useEffect(() => {
    // Create initial session if none exists
    if (!session) {
      createSession();
    }
  }, []);

  return (
    <AppLayout>
      {activeNav === 'settings' ? <SettingsPage /> : <OpsWorkbench />}
    </AppLayout>
  );
}

export default App;
