// src/context/ChatContext.tsx
'use client';

import { AiModel, Chat, ChatContextType, Message } from '@/lib/types/shared_types';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  responding: false,
  chatId: null,
  updateChatId: () => {},
  sendMessage: async () => {},
  chatTitle: null,
  updateChatTitle: () => {},
  clearChat: () => {},
  updateMessages: () => { },
  chats: [],
  refreshChatList: async () => { },
  selectedModel: AiModel.GEMINI_2_0_FLASH_LITE,
  updateSelectedModel: () => { }
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responding, setResponding] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<AiModel>(AiModel.GEMINI_2_0_FLASH_LITE)
  const updateSelectedModel = (model: AiModel) => {
    setSelectedModel(model)
  }

  const API_URL =
    !isSignedIn || isSignedIn === undefined ? '/api/chat/temp' : '/api/chat';

  const updateChatId = (newId: string) => {
    setChatId(newId);
  };

  const updateChatTitle = (newTitle: string) => {
    setChatTitle(newTitle);
  };

  const updateMessages = (messages: Message[]) => {
    setMessages(messages);
  };

  const refreshChatList = useCallback(async () => {
    if (!isSignedIn) {
      setChats([]);
      return;
    }
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      } else {
        console.error('Failed to fetch chats:', await res.text());
        setChats([]); // Clear on error
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  }, [isSignedIn]);

  useEffect(() => {
    refreshChatList();
  }, [refreshChatList]);

  const sendMessage = async (prompt: string): Promise<void> => {
    setResponding(true);

    const userMessage: Message = {
      _id: Date.now().toString(),
      role: 'user',
      text: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    let payload;

    try {
      const history = messages.map(({ role, text }) => ({ role, text }));

      if (chatId && isSignedIn) {
        payload = {
          prompt,
          chatId,
        };
      } else {
        payload = {
          prompt,
          history,
        };
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newChatId = res.headers.get('X-Chat-Id');
      const newChatTitle = res.headers.get('X-Chat-Title');

      if (newChatId) {
        updateChatId(newChatId);
        if (isSignedIn) { 
          router.push(`/chat/${newChatId}`);
          await refreshChatList();
        }
      }

      if (newChatTitle) {
        updateChatTitle(newChatTitle);
      }

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

  const clearChat = () => {
    if (chatTitle !== null) setChatTitle(null);
    console.log('>>> cleared title', chatTitle)
    setMessages([]);
    setResponding(false);
    if(chatId !== null) setChatId(null)
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        responding,
        chatId,
        updateChatId,
        sendMessage,
        chatTitle,
        updateChatTitle,
        clearChat,
        updateMessages,
        chats,
        refreshChatList,
        selectedModel,
        updateSelectedModel
      }}>
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
