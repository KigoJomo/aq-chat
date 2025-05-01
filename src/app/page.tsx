'use client';

import { useEffect } from 'react';
import ChatContainer from './(home)/components/ChatContainer';
import { useChatContext } from '@/context/ChatContext';

export default function Home() {
  const { chatId, newChat } = useChatContext()

  useEffect(() => {
    if (chatId) {
      newChat()
    }
  }, [])

  return (
    <>
      <ChatContainer />
    </>
  );
}
