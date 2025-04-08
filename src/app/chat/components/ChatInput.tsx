'use client';

import { useDeviceType } from '@/hooks/useDeviceType';
import Tooltip from '@/shared/components/ui/Tooltip';
import { useInput } from '@/store/InputStore';
import { LoaderIcon, SendIcon } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export default function ChatInput() {
  const value = useInput((state) => state.value)
  const updateValue = useInput((state) => state.updateValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const updateHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(e.target.value);
    updateHeight();
  };

  useEffect(() => {
    console.log('<<<', value)
    updateHeight();
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const deviceType = useDeviceType();

    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !(deviceType === 'mobileOrTablet')
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    alert(`Input: ${value}`);
    updateValue('');

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <div
      className="
        w-full
        border-2 border-foreground-light/20 focus-within:border-foreground-light/80 rounded-2xl
        bg-background-light 
        px-4 py-4
        flex flex-col gap-4
        transition-all duration-300
      ">
      <textarea
        ref={textareaRef}
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        name=""
        id=""
        className="
          w-full
          resize-none overflow-y-auto
          max-h-48
          p-0
          outline-none focus:outline-none
          text-sm
          transition-all duration-300
        "
        rows={1}
        placeholder="Ask anything ..."
      />

      <div className="w-full flex items-center gap-6 justify-between">
        <Tooltip content="More models coming soon!">
          <span className="capitalize text-xs bg-accent/20 px-2 py-1 rounded-full cursor-pointer">
            gemini 2.0 flash
          </span>
        </Tooltip>

        <button
          onClick={handleSubmit}
          className={`
            ${
              loading || value === ''
                ? 'bg-background-light *:stroke-foreground cursor-not-allowed'
                : 'bg-foreground *:stroke-background hover:bg-foreground-light cursor-pointer'
            } 
            w-fit p-3 rounded-xl flex-shrink-0
            transition-all duration-300
            `}
          type="submit"
          disabled={loading || value === ''}>
          {loading ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : (
            <SendIcon size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
