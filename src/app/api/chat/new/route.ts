import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Chat as ChatInterface } from '@/lib/types/shared_types';
import { generateChatTitle } from '../../actions/ai';
import { createNewChat } from '../../actions/db';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Please log in' }, { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const chatTitle = generateChatTitle(prompt)

    const newChat: ChatInterface = await createNewChat(userId, chatTitle)

    return NextResponse.json({
      newChat: newChat
    })

    /*
    this is a new chat, so: 
      - create a new chat in db
      - send to client:
        - chatId
        - title
    */

    /*  */
  } catch (error) {
    console.error(error);
  }
}
