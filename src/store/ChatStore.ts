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
