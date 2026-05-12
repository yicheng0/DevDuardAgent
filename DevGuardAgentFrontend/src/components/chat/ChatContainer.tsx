import MessageList from './MessageList';
import InputArea from './InputArea';

const ChatContainer = () => {
  return (
    <div className="h-full flex flex-col">
      <MessageList />
      <InputArea />
    </div>
  );
};

export default ChatContainer;
