import { Chat, Message } from '@/lib/types/shared_types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface ChatState {
  // Existing chat state
  chatId: string | null;
  title: string | null;
  chatHistory: Message[];
  isLoading: boolean;
  error: string | null;
  chats: Chat[];

  // Input state (previously in InputStore)
  inputValue: string;

  // Actions
  updateId: (newId: string) => void;
  updateTitle: (newTitle: string) => void;
  addMessage: (newMessage: Message) => void;
  setChatHistory: (history: Message[]) => void;
  clearChat: () => void;
  fetchChats: () => Promise<void>;
  addChatToList: (chat: Chat) => void;

  // Input actions
  updateInputValue: (value: string) => void;
  clearInputValue: () => void;

  // New consolidated actions
  sendMessage: (
    value: string,
    router?: AppRouterInstance | null
  ) => Promise<void>;
  setError: (error: string | null) => void;

  // Modified fields to track loading states separately
  isLoadingChats: boolean;
  isLoadingMessages: boolean;

  // New actions
  renameChat: (id: string, newTitle: string) => void;
  deleteAllChats: () => Promise<void>;
  exportChat: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      // Chat state
      chatId: null,
      title: null,
      chatHistory: [],
      isLoading: false,
      isLoadingChats: false,
      isLoadingMessages: false,
      error: null,
      chats: [],

      // Input state
      inputValue: '',

      // Chat actions
      // TODO: split this into updateId and loadChat
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
          inputValue: '',
          // any other state that might need resetting
          error: null,
        });
      },

      fetchChats: async () => {
        // Skip fetching if chats already exist and we're not forcing a refresh
        // This prevents unnecessary loading states when chats are already loaded
        if (get().chats.length > 0) {
          return;
        }

        try {
          set({ isLoadingChats: true });
          const res = await fetch('/api/chats');
          if (!res.ok) {
            throw new Error('Failed to fetch chats');
          }
          const data = await res.json();
          set({ chats: data || [] }); // Fix: handle the response format correctly
        } catch (error) {
          console.error('Error fetching chats:', error);
          set({ error: 'Failed to load chats.' });
        } finally {
          set({ isLoadingChats: false });
        }
      },

      addChatToList: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
        })),

      // Input actions
      updateInputValue: (value) => set({ inputValue: value }),
      clearInputValue: () => set({ inputValue: '' }),

      // Error handling
      setError: (error) => set({ error }),

      // Consolidated send message action with router support
      sendMessage: async (value, router = null) => {
        const { chatId, addMessage, setError } = get();

        if (!value.trim()) return;

        // Only set loading for messages, not for the entire state
        set({ isLoadingMessages: true, error: null });

        // Generate temp ID for new chats and handle optimistic updates
        const isNewChat = !chatId;
        const tempChatId = isNewChat ? `temp-${Date.now()}` : chatId;

        // Optimistic update with temporary message
        const tempMessage: Message = {
          _id: `temp-msg-${Date.now()}`,
          role: 'user',
          text: value,
          timestamp: new Date(),
          chatId: tempChatId!,
        };

        // For new chats, set temp values and redirect
        if (isNewChat) {
          // Create temporary chat entry
          const tempChat: Chat = {
            _id: tempChatId,
            userId: 'temp-user',
            title: value.slice(0, 30) + (value.length > 30 ? '...' : ''),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Update state optimistically
          set({
            chatId: tempChatId,
            title: tempChat.title,
            chatHistory: [tempMessage],
          });

          // Add to chat list
          get().addChatToList(tempChat);

          // Navigate to the chat page with temp ID using Next.js router if available
          if (router) {
            router.push(`/chat/${tempChatId}`);
          } else {
            // Fallback to history API (won't trigger page component change)
            window.history.pushState({}, '', `/chat/${tempChatId}`);
          }
        } else {
          // For existing chats, simply add the message
          addMessage(tempMessage);
        }

        // Clear input immediately for better UX
        set({ inputValue: '' });

        try {
          // Send the request to the consolidated API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: value, chatId: chatId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
          }

          const data = await response.json();

          // Handle new chat creation - replace temp ID with real one
          if (data.isNewChat && data.chat) {
            const realChatId = data.chat._id;

            // Replace the temporary chat with the real one
            set((state) => ({
              chatId: realChatId,
              title: data.chat.title,
              chats: state.chats.map((c) =>
                c._id === tempChatId ? { ...data.chat } : c
              ),
              // Update chat history with real message IDs
              chatHistory: state.chatHistory.map((msg) =>
                msg._id === tempMessage._id ? data.messages.user : msg
              ),
            }));

            // Update URL without full page reload
            if (tempChatId !== realChatId) {
              if (router) {
                router.replace(`/chat/${realChatId}`);
              } else {
                window.history.replaceState({}, '', `/chat/${realChatId}`);
              }
            }
          }

          // Add AI response to chat history
          if (data.messages && data.messages.ai) {
            addMessage(data.messages.ai);
          }
        } catch (err) {
          // If error occurs during a new chat creation, revert the optimistic updates
          if (isNewChat) {
            set((state) => ({
              chatId: null,
              title: null,
              chats: state.chats.filter((c) => c._id !== tempChatId),
              chatHistory: [],
            }));

            // Return to base chat URL
            if (router) {
              router.replace('/chat');
            } else {
              window.history.replaceState({}, '', '/chat');
            }
          }

          setError(
            err instanceof Error ? err.message : 'An unexpected error occurred'
          );
          console.error('Submission error:', err);
        } finally {
          // Only reset message loading state
          set({ isLoadingMessages: false });
        }
      },

      // New actions
      renameChat: async (id, newTitle) => {
        try {
          // First, update the state optimistically
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat._id === id ? { ...chat, title: newTitle } : chat
            ),
          }));

          // If this is the current chat, update its title too
          if (get().chatId === id) {
            set({ title: newTitle });
          }

          // Then make the API call
          const response = await fetch(`/api/chats/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTitle }),
          });

          if (!response.ok) {
            throw new Error('Failed to rename chat');
          }
        } catch (error) {
          console.error('Error renaming chat:', error);
          // Reload chats to restore state in case of failure
          get().fetchChats();
          set({ error: 'Failed to rename chat' });
        }
      },

      deleteAllChats: async () => {
        const previousChats = get().chats;
        try {
          // Optimistically clear the UI first
          set({ chats: [] });

          // Clear current chat if there is one
          get().clearChat();

          // Make API request
          const response = await fetch('/api/chats', {
            method: 'DELETE',
          });

          if (!response.ok) {
            // log the error:
            const errorData = await response.json();
            console.error('Error deleting all chats:', errorData);
            throw new Error('Failed to delete all chats');
          }
          window.location.href = '/chat';
        } catch (error) {
          console.error('Error deleting all chats:', error);
          set({
            chats: previousChats,
            error: 'Failed to delete all chats',
          });
        }
      },

      exportChat: (id) => {
        const { chats } = get();
        const chat = chats.find((c) => c._id === id);

        if (!chat) return;

        // Export logic - example creates a downloadable text file
        const content = JSON.stringify(chat, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${chat.title.replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      deleteChat: async (id) => {
        try {
          // Optimistically remove from UI first
          set((state) => ({
            chats: state.chats.filter((chat) => chat._id !== id),
          }));

          // If current chat is being deleted, clear the state
          if (get().chatId === id) {
            get().clearChat();
          }

          // Make API request to delete the chat
          const response = await fetch(`/api/chats/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete chat');
          }
        } catch (error) {
          console.error('Error deleting chat:', error);
          // Reload chats to restore state in case of failure
          get().fetchChats();
          set({ error: 'Failed to delete chat' });
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        // Don't persist temporary/sensitive data
      }),
    }
  )
);
