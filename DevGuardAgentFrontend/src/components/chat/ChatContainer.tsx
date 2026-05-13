import MessageList from './MessageList';
import InputArea from './InputArea';

interface ChatContainerProps {
  compact?: boolean;
}

const ChatContainer = ({ compact = false }: ChatContainerProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffdf8]">
      <MessageList compact={compact} />
      <InputArea compact={compact} />
    </div>
  );
};

export default ChatContainer;
