import { Chat, Message } from '@/lib/types/shared_types';
import { create } from 'zustand';

interface ChatState {
  chatId: string | null;
  title: string | null;
  chatHistory: Message[];
  isLoading: boolean;
  error: string | null;
  chats: Chat[];
  updateId: (newId: string) => void;
  updateTitle: (newTitle: string) => void;
  addMessage: (newMessage: Message) => void;
  setChatHistory: (history: Message[]) => void;
  clearChat: () => void;
  fetchChats: () => Promise<void>;
  addChatToList: (chat: Chat) => void;
}

export const useChat = create<ChatState>((set) => ({
  chatId: null,
  title: null,
  chatHistory: [],
  isLoading: false,
  error: null,
  chats: [],

  updateId: async (newId) => {
    try {
      const res = await fetch(`/api/chat/${newId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to retrieve chat');
      }
      const data = await res.json();

      set({
        chatId: newId,
        title: data.chat.title,
        chatHistory: data.chatHistory,
      });
    } catch (error) {
      console.error('Failed to retrieve chat:', error);
      set({ error: 'Failed to retrieve chat.' });
    }
  },

  updateTitle: (newTitle) => set({ title: newTitle }),

  addMessage: (newMessage) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, newMessage],
    })),

  setChatHistory: (history) => set({ chatHistory: history }),

  clearChat: () => {
    set({
      chatId: null,
      title: null,
      chatHistory: [],
    });
  },

  // Fetch chat list
  fetchChats: async () => {
    try {
      const res = await fetch('/api/chats');

      if (!res.ok) throw new Error('Failed to fetch chats.');

      const chats = await res.json();
      set({ chats });
    } catch (error) {
      console.error('Chat list load failed:', error);
      set({ error: 'Failed to load chat history' });
    }
  },

  // Add chat to local state
  addChatToList: (chat) => {
    set((state) => ({
      chats: [chat, ...state.chats],
    }));
  },
}));
