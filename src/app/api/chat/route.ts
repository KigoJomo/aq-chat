import { NextRequest, NextResponse } from 'next/server';
import { Message as MessageInterface } from '@/lib/types/shared_types';
import { createNewChat, getChatHistory } from '@/data/chat';
import { generateAIResponse, generateChatTitle } from '@/data/ai';
import { saveMessageToDb } from '@/data/message';

export async function POST(req: NextRequest) {
  try {
    const { prompt, chatId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let newChat;
    let history: MessageInterface[] = [];

    if (!chatId) {
      newChat = await createNewChat(generateChatTitle(prompt));
      if (newChat instanceof NextResponse) return newChat;
      await saveMessageToDb(newChat._id!, 'user', prompt);
    }

    if (chatId) {
      const hist = await getChatHistory(chatId);
      if (hist instanceof NextResponse) return hist;
      history = hist;
    }

    return generateAIResponse(prompt, history, chatId || newChat?._id);
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
