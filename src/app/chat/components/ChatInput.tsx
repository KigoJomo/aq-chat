'use client';

import { useDeviceType } from '@/hooks/useDeviceType';
import Tooltip from '@/shared/components/ui/Tooltip';
import { useInput } from '@/store/InputStore';
import { LoaderIcon, SendIcon } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useChat } from '@/store/ChatStore';
import { Message } from '@/lib/types/shared_types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ChatInput() {
  const value = useInput((state) => state.value);
  const { chatId, updateId, addChatToList } = useChat();
  const updateValue = useInput((state) => state.updateValue);
  const addMessage = useChat((state) => state.addMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const deviceType = useDeviceType();
  const router = useRouter();

  // Textarea height management
  const updateHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(e.target.value);
    updateHeight();
    setError(null); // Clear error on new input
  };

  useEffect(() => updateHeight(), [value]);

  // Enhanced keyboard handling
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (deviceType === 'desktop' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  // Improved submission handler with better error states
  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);

    try {
      updateValue('');
      let currentChatId = chatId;

      /*
      1. Create new chat if no existing chatId
        - POST /api/chat/new
        - Expect: { newChat: { _id, title } }
        - Update Zustand state
        - Redirect to new chat route
      
      2. Optimistic UI update:
        - Add temporary user message
        - Maintain scroll position
      
      3. Process AI response:
        - Replace temporary message with persisted data
        - Add AI response to history
      */
      
      if (!currentChatId) {
        const newChatRes = await fetch('/api/chat/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: value }),
        });

        if (!newChatRes.ok) {
          const errorData = await newChatRes.json();
          throw new Error(errorData.error || 'Failed to create new chat');
        }

        const data = await newChatRes.json();
        currentChatId = data.newChat._id;
        updateId(currentChatId!);
        addChatToList(data.newChat);
        await router.push(`/chat/${currentChatId}`);
      }

      // Optimistic update with temporary message
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        role: 'user',
        text: value,
        timestamp: new Date(),
        chatId: currentChatId!,
      };
      addMessage(tempMessage);

      // Process AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value, chatId: currentChatId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      addMessage(data.aiMessage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className={cn(
        "mx-auto max-w-3xl px-4 py-4",
        "border border-foreground/10 rounded-2xl bg-background",
        "shadow-lg transition-all duration-300",
        "focus-within:border-foreground/30 focus-within:shadow-xl"
      )}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            aria-label="Chat input"
            className={cn(
              "w-full resize-none overflow-y-auto pr-4",
              "bg-transparent text-sm focus:outline-none",
              "placeholder:text-foreground/50",
              "scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent"
            )}
            rows={1}
            maxLength={2000}
          />

          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Tooltip content="Model selector coming soon!">
                <span className="text-xs text-foreground/60 hover:text-foreground/80 transition-colors">
                  Gemini 2.0 Flash
                </span>
              </Tooltip>
              
              {error && (
                <span className="text-xs text-red-500 animate-pulse">
                  {error}
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !value.trim()}
              className={cn(
                "p-2 rounded-full transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "enabled:hover:bg-foreground/10",
                "focus:outline-none focus:ring-2 focus:ring-foreground/20",
                loading ? "cursor-wait" : "cursor-pointer"
              )}
              aria-label={loading ? "Processing..." : "Send message"}
            >
              {loading ? (
                <LoaderIcon className="w-5 h-5 animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5 text-foreground/80 hover:text-foreground" />
              )}
            </button>
          </div>

          {value.length > 0 && (
            <span className="absolute bottom-14 right-0 text-xs text-foreground/50">
              {value.length}/2000
            </span>
          )}
        </div>
      </div>
    </div>
  );
}