import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory, saveMessageToDb } from '../actions/db';
import { generateAIResponse } from '../actions/ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, chatId } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Please log in' }, { status: 401 });
    }

    if (!chatId) {
      console.log('\n\n >>>> Invalid chat id', chatId)
      return NextResponse.json({ error: 'Invalid chat id' }, { status: 400 });
    }

    if (!prompt) {
      console.log('Message is required')
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const chatHistory = await getChatHistory(chatId)

    const savedUserMessage = await saveMessageToDb(chatId, 'user', prompt)

    const aiResponse: string | NextResponse<{ error: string; }> = await generateAIResponse(prompt, chatHistory)

    // Save AI response to database if it's a string (not an error)
    let savedAiMessage;
    if (typeof aiResponse === 'string') {
      savedAiMessage = await saveMessageToDb(chatId, 'model', aiResponse);
      
      return NextResponse.json({
        userMessage: savedUserMessage.toObject(),
        aiMessage: savedAiMessage.toObject()
      });
    } else {
      // If aiResponse is already a NextResponse with an error
      return aiResponse;
    }

    /*
    this is an existing chat, so:
      - save user message to db
      - get AI response
      - save AI response to db
      - send to client:
        - saved user message
        - AI response
    */

    /*  */
  } catch (error) {
    console.error(error);
  }
}
