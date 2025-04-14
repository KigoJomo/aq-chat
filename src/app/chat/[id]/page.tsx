// src/app/chat/[id]/page.tsx

'use client';

import { useChat } from '@/store/ChatStore';
import ChatHistory from '../components/ChatHistory';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { isValidObjectId } from '@/lib/utils';

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;

  const { isLoaded, userId } = useAuth();
  const { chatId, updateId } = useChat();

  useEffect(() => {
    if (isLoaded && userId) {
      // For temporary IDs (from optimistic updates), we don't need to fetch
      if (id.startsWith('temp-')) {
        return;
      }

      // Only fetch if the ID is valid and different from current
      if (isValidObjectId(id) && id !== chatId) {
        updateId(id);
      }
    }
  }, [id, isLoaded, userId, chatId, updateId]);

  return (
    <>
      <ChatHistory />
    </>
  );
}
