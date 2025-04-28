'use client';

import { ChatContextType, Message } from '@/lib/types/shared_types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  responding: false,
  sendMessage: async () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [responding, setResponding] = useState<boolean>(false);

  const API_URL = '/api/chat/temp';

  const sendMessage = async (prompt: string): Promise<void> => {
    setResponding(true);

    const userMessage: Message = {
      _id: Date.now().toString(),
      role: 'user',
      text: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const history = messages.map(({ role, text }) => ({ role, text }));

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history,
        }),
      });

      const modelResId = Date.now().toString();

      setMessages((prev) => [
        ...prev,
        {
          _id: modelResId,
          text: '',
          role: 'model',
          timestamp: new Date(),
        },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        setMessages((prev) => {
          const newArr = [...prev];
          const index = newArr.findIndex(
            (message) => message._id === modelResId
          );
          if (index !== -1) {
            newArr[index] = {
              ...newArr[index],
              text:
                newArr[index].text + decoder.decode(value, { stream: true }),
            };
          }
          return newArr;
        });
      }
    } catch (error) {
      console.error('An error occurred: ', error);
    } finally {
      setResponding(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, responding, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }

  return context;
};
