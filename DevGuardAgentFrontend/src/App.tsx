import AppLayout from '@/components/layout/AppLayout';
import ChatContainer from '@/components/chat/ChatContainer';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import AIOpsPanel from '@/components/aiops/AIOpsPanel';
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

  const hasMessages = session && session.messages.length > 0;

  return (
    <AppLayout>
      {hasMessages ? <ChatContainer /> : <WelcomeScreen />}
      <AIOpsPanel />
    </AppLayout>
  );
}

export default App;
