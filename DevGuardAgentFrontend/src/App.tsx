import AppLayout from '@/components/layout/AppLayout';
import OpsWorkbench from '@/components/ops/OpsWorkbench';
import { useChatStore } from '@/stores/chatStore';
import { useEffect } from 'react';

function App() {
  const { getCurrentSession, createSession } = useChatStore();
  const session = getCurrentSession();

  useEffect(() => {
    // Create initial session if none exists
    if (!session) {
      createSession();
    }
  }, []);

  return (
    <AppLayout>
      <OpsWorkbench />
    </AppLayout>
  );
}

export default App;
