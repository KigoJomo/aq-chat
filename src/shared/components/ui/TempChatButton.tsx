'use client';

import { useChatContext } from '@/context/ChatContext';
import Tooltip from './Tooltip';
import { cn } from '@/lib/utils';
import { MessageCircleDashed } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const TempChatButton = () => {
  const { tempChat, toggleTempChat } = useChatContext();
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  return (
    <>
      {isSignedIn && pathname === '/' && (
        <Tooltip content="Temporary Chat" size="sm" position="left">
          <button
            onClick={toggleTempChat}
            className={cn(
              'px-2 aspect-square shrink-0 flex items-center justify-center rounded-full',
              tempChat ? 'bg-accent/30' : 'bg-background-light',
              'transition-all duration-100'
            )}>
            <MessageCircleDashed size={16} />
          </button>
        </Tooltip>
      )}
    </>
  );
};

export default TempChatButton;
