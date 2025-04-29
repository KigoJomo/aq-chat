'use client';

import { useChatContext } from '@/context/ChatContext';
import { useClipBoard } from '@/hooks/useClipboard';
import MarkdownRenderer from '@/shared/components/ui/MarkdownRenderer';
import { Check, CopyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ChatContainer() {
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();
  const { chatId, messages, updateMessages, updateChatTitle } =
    useChatContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        console.log(
          `ChatContainer Effect: Fetching chat data for chatId: ${chatId}`
        );
        try {
          setLoading(true);
          const res = await fetch(`/api/chat/${chatId}`);
          if (res.ok) {
            const data = await res.json();
            console.log(
              `ChatContainer Effect: Received data for ${chatId}`,
              data
            );
            updateMessages(data.chatHistory || []);
            updateChatTitle(data.chat?.title || 'Chat');
          } else {
            console.error(
              `ChatContainer Effect: Failed to fetch chat ${chatId}:`,
              res.status,
              await res.text()
            );
          }
        } catch (error) {
          console.error(
            `ChatContainer Effect: Error loading chat ${chatId}:`,
            error
          );
        } finally {
          setLoading(false);
        }
      } else {
        console.log('ChatContainer Effect: chatId is null, skipping fetch.');
      }
    };

    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  return (
    <div
      className="
        w-full md:max-w-[48rem] flex-1
        flex flex-col gap-8
        transition-all duration-300
      ">
      {loading && (
        <>
          <div className="w-48 aspect-square rounded-full shrink-0 bg-background-light animate-pulse mx-auto mt-24"></div>
        </>
      )}
      {messages && messages.length > 0 ? (
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
