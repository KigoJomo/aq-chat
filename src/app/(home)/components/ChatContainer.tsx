'use client';

import { useChatContext } from '@/context/ChatContext';
import { useClipBoard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/shared/components/ui/MarkdownRenderer';
import { ArrowDown, Check, CopyIcon } from 'lucide-react';
import { useCallback, useRef } from 'react';

export default function ChatContainer() {
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();
  const { messages, loadingMessages: loading } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  return (
    <div
      className="
        w-full md:max-w-[48rem] flex-1
        flex flex-col gap-8
        relative
        transition-all duration-300
      ">
      {loading ? (
        <>
          <div className="w-48 aspect-square rounded-full shrink-0 bg-background-light animate-pulse mx-auto mt-24"></div>
        </>
      ) : messages.length > 0 ? (
        <>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`
                w-full flex items-start gap-2 relative group
                ${message.role === 'user' ? 'animate-fade-in-up' : ''}`}>
              <div
                className={`${
                  message.role === 'user'
                    ? 'bg-background-light/100 px-3 py-2 rounded-2xl ml-auto w-fit max-w-80 md:max-w-[36rem]'
                    : 'flex flex-col gap-4 w-full'
                }`}>
                <MarkdownRenderer
                  markdownContent={message.text}
                  className="max-w-full prose dark:prose-invert"
                />

                {/* button(s) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(message.text, index)}
                    className={`
                  ${
                    message.role === 'user'
                      ? 'absolute top-2 right-full mr-2 opacity-0 group-hover:opacity-100'
                      : '*:hover:stroke-accent'
                  }
                  transition-all cursor-pointer
                `}
                    aria-label={
                      copiedMessageIndex === index
                        ? 'Copied to clipboard'
                        : 'Copy message'
                    }>
                    {copiedMessageIndex === index ? (
                      <Check size={14} className="" />
                    ) : (
                      <CopyIcon size={14} className="transition-all" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="w-full mb-24"></div>

          <button
            className={cn(
              'sticky bottom-32 mx-auto z-50',
              'flex items-center justify-center',
              'w-8 h-8 rounded-full',
              'border border-foreground-light/30',
              'bg-background/80 backdrop-blur-sm',
              'transition-all duration-300 ease-in-out',
              'hover:bg-background-light/80 hover:border-foreground-light/50',
              'animate-fade-in-up'
            )}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom">
            <ArrowDown
              size={14}
              className="text-foreground-light/60 transition-colors group-hover:text-foreground-light"
            />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="text-2xl">How can I help?</span>
        </div>
      )}
    </div>
  );
}
