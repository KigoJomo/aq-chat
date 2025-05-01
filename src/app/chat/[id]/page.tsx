'use client';

import ChatContainer from '@/app/(home)/components/ChatContainer';
import { useChatContext } from '@/context/ChatContext';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { chatId: contextChatId, openChat } = useChatContext();

  useEffect(() => {
    if (id && id !== contextChatId) {
      //  updateChatId(id);
      openChat(id);
    } else if (!id && contextChatId) {
      openChat(contextChatId);
    }
  }, []);

  return <ChatContainer />;
}
