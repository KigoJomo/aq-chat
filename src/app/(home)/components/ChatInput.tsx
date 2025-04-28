'use client';

import { useChatContext } from '@/context/ChatContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import Tooltip from '@/shared/components/ui/Tooltip';
import { ArrowUp, Plus, Squircle } from 'lucide-react';
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function ChatInput() {
  const [prompt, setPrompt] = useState<string>('');
  const { sendMessage, responding } = useChatContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deviceType = useDeviceType();

  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, []);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    updateHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (deviceType === 'desktop' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    sendMessage(prompt);
    setPrompt('');
  };

  useEffect(() => updateHeight(), [prompt, updateHeight]);

  return (
    <div
      className={`
        w-full md:w-[42rem] flex flex-col gap-4 px-4 pb-2 pt-3 mt-auto
        sticky bottom-4
        bg-background-light border border-foreground-light/10 focus-within:border-foreground-light/50 rounded-3xl
        transition-all duration-300
      `}>
      <textarea
        name="chat-input"
        id="chat-input"
        ref={textareaRef}
        value={prompt}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything"
        className={`
          w-full overflow-y-auto
          resize-none outline-none focus:outline-none bg-transparent
          text-sm px-2
        `}
        rows={1}
      />

      <div
        className="
          buttons w-full
          flex items-center gap-2
        ">
        <Tooltip content="Attachments coming soon!" size="sm" position="right">
          <button
            className={`
              border border-foreground-light/20 rounded-full p-2
              cursor-pointer
            `}>
            <Plus size={16} className="stroke-foreground-light" />
          </button>
        </Tooltip>

        <Tooltip content="More models coming soon!" size="sm" position="right">
          <button
            className={`
              border border-foreground-light/20 rounded-full p-2
              text-xs
              cursor-pointer
            `}>
            Gemini 2.0 Flash
          </button>
        </Tooltip>

        <button
          className={`
              bg-foreground rounded-full p-2
              ml-auto
              ${
                responding
                  ? 'cursor-default animate-pulse'
                  : 'cursor-pointer hover:bg-foreground-light'
              }
              transition-all duration-300
            `}
          onClick={handleSubmit}
          disabled={responding || !prompt.trim()}>
          {responding ? (
            <Squircle size={16} className="fill-background" />
          ) : (
            <ArrowUp size={16} className="stroke-background" />
          )}
        </button>
      </div>
    </div>
  );
}
