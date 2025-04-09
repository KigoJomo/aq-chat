"use client"

import { Logo } from '@/shared/components/ui/Logo';
import { useInput } from '@/store/InputStore';

export default function ChatIntro() {
  const suggestions = [
    'What is machine learning?',
    'Tell me a fun fact',
    'How do I learn coding?',
  ];

  const updateValue = useInput((state) => state.updateValue)

  return (
    <div className="w-full my-auto flex flex-col items-center gap-4">
      <Logo size={128} />
      
      <div className="text-center">
        <h1 className="text-solid-foreground mb-2 !normal-case">
          Hi 👋, I&apos;m Aq!
        </h1>
        <p className="text-sm mb-6">Try asking something to get started</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="bg-background-light hover:bg-background-light/80 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-300"
              onClick={() => updateValue(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
