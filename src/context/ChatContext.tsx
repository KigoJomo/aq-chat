// src/context/ChatContext.tsx
'use client';

import { AiModel, Chat, Message } from '@/lib/types/shared_types';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ChatContextType {
  sendMessage: (prompt: string) => Promise<void>;
  responding: boolean;

  selectedModel: AiModel;
  updateSelectedModel: (model: AiModel) => void;

  messages: Message[];
  updateMessages: (messages: Message[]) => void;
  loadingMessages: boolean;

  chatId: string | null;
  updateChatId: (newId: string) => void;

  chatTitle: string | null;
  updateChatTitle: (newTitle: string) => void;

  chats: Chat[];
  refreshChatList: () => Promise<void>;

  openChat: (chatId: string, chatTitle?: string) => Promise<void>;

  newChat: () => void;

  tempChat: boolean;
  toggleTempChat: () => void;
}

const DEFAULT_MODEL = AiModel.GEMINI_2_0_FLASH_LITE;

export const ChatContext = createContext<ChatContextType>({
  sendMessage: async () => {},
  responding: false,

  selectedModel: DEFAULT_MODEL,
  updateSelectedModel: () => {},

  messages: [],
  updateMessages: () => {},
  loadingMessages: false,

  chatId: null,
  updateChatId: () => {},

  chatTitle: null,
  updateChatTitle: () => {},

  chats: [],
  refreshChatList: async () => {},

  openChat: async () => {},

  newChat: () => {},

  tempChat: false,
  toggleTempChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [responding, setResponding] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [tempChat, setTempChat] = useState<boolean>(false);

  const [selectedModel, setSelectedModel] = useState<AiModel>(DEFAULT_MODEL);
  const updateSelectedModel = (model: AiModel) => {
    setSelectedModel(model);
  };

  let chatApiUrl;

  if (!isSignedIn || isSignedIn === undefined || tempChat) {
    chatApiUrl = '/api/chat/temp';
  } else {
    chatApiUrl = '/api/chat';
  }

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

      const res = await fetch(chatApiUrl, {
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

  const openChat = async (chatId: string, chatTitle?: string) => {
    setChatId(chatId);
    setMessages([]);
    if (chatTitle) setChatTitle(chatTitle);
    if (tempChat) setTempChat(false)

    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();

        setChatTitle(data.chat.title);
        setMessages(data.chatHistory);
        router.push(`/chat/${chatId}`);
      } else {
        console.error(
          `Failed to fetch chat ${chatId}: `,
          res.status,
          await res.text()
        );
      }
    } catch (error) {
      console.error(`Error loading chat ${chatId}: `, error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const newChat = () => {
    setChatId(null);
    setChatTitle(null);
    setMessages([]);
    setResponding(false);
    router.push('/');
  };

  const toggleTempChat = () => {
    if (chatId === null && !tempChat) {
      setTempChat(true);
      setChatTitle('Temporary Chat');
    } else {
      setTempChat(false);
      setChatTitle(null);

      if (messages.length > 0) {
        newChat();
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        responding,
        selectedModel,
        updateSelectedModel,
        messages,
        updateMessages,
        loadingMessages,
        chatId,
        updateChatId,
        chatTitle,
        updateChatTitle,
        chats,
        refreshChatList,
        openChat,
        newChat,
        tempChat,
        toggleTempChat,
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
