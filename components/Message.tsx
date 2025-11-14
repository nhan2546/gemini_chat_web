
import React from 'react';
import { ChatMessage, ChatRole } from '../types';
import { UserIcon, BotIcon, LoadingDots } from '../constants';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === ChatRole.USER;

  const messageContainerClasses = isUser
    ? 'flex items-end justify-end'
    : 'flex items-end';

  const messageBubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-t-lg rounded-bl-lg'
    : 'bg-gray-700 text-gray-200 rounded-t-lg rounded-br-lg';
    
  const Avatar = () => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'ml-3 bg-gray-600' : 'mr-3 bg-indigo-500'}`}>
      {isUser ? <UserIcon /> : <BotIcon />}
    </div>
  );

  return (
    <div className={`${messageContainerClasses} mb-4`}>
      {!isUser && <Avatar />}
      <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 ${messageBubbleClasses}`}>
        {message.isTyping ? <LoadingDots /> : <p className="text-sm break-words">{message.content}</p>}
      </div>
      {isUser && <Avatar />}
    </div>
  );
};

export default Message;
