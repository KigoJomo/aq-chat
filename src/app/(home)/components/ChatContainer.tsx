'use client';

import { useChatContext } from '@/context/ChatContext';
import { useClipBoard } from '@/hooks/useClipboard';
import MarkdownRenderer from '@/shared/components/ui/MarkdownRenderer';
import { Check, CopyIcon, RefreshCcw, SquarePen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatContainer() {
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();
  const { messages, loadingMessages: loading } = useChatContext();

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
                w-full flex flex-col gap-4 group
                ${
                  message.role === 'user'
                    ? 'items-end animate-fade-in-up'
                    : 'items-start'
                }`}>
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
              </div>

              {/* button(s) */}
              <div
                className={cn(
                  'px-2 flex items-center gap-4',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-300',
                  '[&>*]:transition-all [&>*]:duration-300 [&>*]:opacity-50 [&>*]:hover:opacity-100'
                )}>
                {message.role === 'user' && (
                  <>
                    <button
                      className={cn('hover:scale-105')}
                      aria-label="Regenerate message">
                      <RefreshCcw size={14} />
                    </button>

                    <button className={cn('hover:scale-105')}>
                      <SquarePen size={14} />
                    </button>
                  </>
                )}

                <button
                  className={cn('hover:scale-105')}
                  onClick={() => copyToClipboard(message.text, index)}
                  aria-label={
                    copiedMessageIndex === index
                      ? 'Copied to clipboard'
                      : 'Copy message'
                  }>
                  {copiedMessageIndex === index ? (
                    <Check size={14} />
                  ) : (
                    <CopyIcon size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
          <div className="w-full mb-24"></div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="text-2xl">How can I help?</span>
        </div>
      )}
    </div>
  );
}
