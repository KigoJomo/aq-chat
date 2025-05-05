'use client';

import { useChatContext } from '@/context/ChatContext';
import { AiModel } from '@/lib/types/shared_types';
import { getDisplayName, cn } from '@/lib/utils';
import Tooltip from '@/shared/components/ui/Tooltip';
import { FC, useEffect, useRef, useState } from 'react';

const ModelSelector: FC = () => {
  const { selectedModel, updateSelectedModel } = useChatContext();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelector = () => {
    setSelectorOpen(!selectorOpen);
  };

  return (
    <div className="relative">
      <Tooltip content="Select AI Model" size="sm" position="right">
        <button
          onClick={toggleSelector}
          className={cn(
            'border border-foreground-light/20 rounded-full p-2',
            'text-xs',
            'cursor-pointer hover:bg-foreground-light/10',
            'transition-colors duration-200'
          )}>
          {getDisplayName(selectedModel)}
        </button>
      </Tooltip>

      {selectorOpen && (
        <div
          ref={selectorRef}
          className={cn(
            'absolute bottom-[110%] w-fit p-2 animate-fade-in-up',
            'bg-background/10 backdrop-blur-3xl border border-foreground-light/20',
            'rounded-3xl flex flex-col gap-2'
          )}>
          {Object.entries(AiModel).map(([key, model]) => (
            <button
              key={key}
              onClick={() => {
                updateSelectedModel(model);
                setSelectorOpen(false);
              }}
              className={cn(
                'hover:bg-foreground-light/10',
                'px-3 py-1 rounded-2xl transition-colors',
                'text-left',
                model === selectedModel && 'bg-accent/20'
              )}>
              <span className="text-xs whitespace-nowrap">
                {getDisplayName(model)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
