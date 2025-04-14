'use client';

import { useDeviceType } from '@/hooks/useDeviceType';
import Tooltip from '@/shared/components/ui/Tooltip';
import { LoaderIcon, SendIcon } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { useChat } from '@/store/ChatStore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const MAX_LENGTH = 10000;

export default function ChatInput() {
  const {
    inputValue: value,
    updateInputValue,
    isLoadingMessages: loading, // Use the specific loading state
    error,
    sendMessage,
    setError,
  } = useChat();

  const router = useRouter(); // Add the router hook
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deviceType = useDeviceType();

  // Textarea height management
  const updateHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateInputValue(e.target.value);
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

  // Simplified submission handler using consolidated store function with router
  const handleSubmit = () => {
    if (!value.trim() || loading) return;
    sendMessage(value, router); // Pass the router instance
  };

  return (
    <div className="sticky bottom-2 w-full bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div
        className={cn(
          'mx-auto max-w-3xl px-4 py-4',
          'border border-foreground/10 rounded-2xl bg-background',
          'shadow-lg transition-all duration-300',
          'focus-within:border-foreground/30 focus-within:shadow-xl'
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
              'w-full resize-none overflow-y-auto pr-4',
              'bg-transparent text-sm focus:outline-none',
              'placeholder:text-foreground/50',
              'scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent'
            )}
            rows={1}
            maxLength={MAX_LENGTH}
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
                'p-2 rounded-full transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'enabled:hover:bg-foreground/10',
                'focus:outline-none focus:ring-2 focus:ring-foreground/20',
                loading ? 'cursor-wait' : 'cursor-pointer'
              )}
              aria-label={loading ? 'Processing...' : 'Send message'}>
              {loading ? (
                <LoaderIcon className="w-5 h-5 animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5 text-foreground/80 hover:text-foreground" />
              )}
            </button>
          </div>
          {value.length > 0 && (
            <span className="absolute bottom-14 right-0 text-xs text-foreground/50">
              {value.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
