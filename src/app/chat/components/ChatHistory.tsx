'use client';

import { useClipBoard } from '@/hooks/useClipboard';
import MarkdownRenderer from '@/shared/components/ui/MarkdownRenderer';
import { useChat } from '@/store/ChatStore';
import { Check, CopyIcon } from 'lucide-react';

export default function ChatHistory() {
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();
  const { chatHistory } = useChat();

  return (
    <div
      className="
        md:w-[42rem] md:mx-auto 
        flex-1 flex flex-col gap-4
        pb-24
      ">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`
            w-full flex items-start gap-2
            animate-fade-in-up
            ${
            message.role === 'user' ? 'flex-row-reverse ml-auto' : ''
          }`}>
          <div className="relative group w-full">
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
                           transition-all cursor-pointer`}
                  aria-label={
                    copiedMessageIndex === index
                      ? 'Copied to clipboard'
                      : 'Copy message'
                  }>
                  {copiedMessageIndex === index ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <CopyIcon size={14} className="transition-all" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
