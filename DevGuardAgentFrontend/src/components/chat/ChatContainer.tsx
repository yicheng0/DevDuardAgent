import MessageList from './MessageList';
import InputArea from './InputArea';

const ChatContainer = () => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <MessageList />
      <InputArea />
    </div>
  );
};

export default ChatContainer;
