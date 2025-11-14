import React, { useState, useCallback } from 'react';
import { ChatMessage, ChatRole } from './types';
import { sendMessage } from './services/geminiService';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { BotIcon } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: ChatRole.MODEL, content: "Hello! How can I help you with our products today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (messageText: string) => {
    setIsLoading(true);
    const userMessage: ChatMessage = { role: ChatRole.USER, content: messageText };
    const newMessages: ChatMessage[] = [...messages, userMessage];

    // Add user message and typing indicator to the UI immediately
    const typingIndicator: ChatMessage = { role: ChatRole.MODEL, content: '', isTyping: true };
    setMessages(prev => [...prev, userMessage, typingIndicator]);

    try {
      // Pass the updated message history to the backend
      const modelResponseText = await sendMessage(newMessages);
      const modelResponse: ChatMessage = { role: ChatRole.MODEL, content: modelResponseText };
      
      // Replace typing indicator with the actual response from the model
      setMessages(prev => [...prev.slice(0, -1), modelResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: ChatRole.MODEL, content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 font-sans">
      <header className="flex items-center p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 mr-3">
          <BotIcon />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Sales Assistant</h1>
          <p className="text-sm text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Online
          </p>
        </div>
      </header>
      <MessageList messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;