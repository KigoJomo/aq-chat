import { Message as MessageInterface } from '@/lib/types/shared_types';
import { formatHistory } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { saveMessageToDb } from './message';

const MODEL_NAME = 'gemini-2.0-flash';
// const MODEL_NAME = 'gemini-2.0-flash-lite';

export async function generateAIResponse(
  prompt: string,
  history: MessageInterface[],
  chatId?: string,
  title?: string
) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const formattedHistory = formatHistory(history);

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: formattedHistory,
  });

  let fullText = '';

  const response = await chat.sendMessageStream({
    message: prompt,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      for await (const chunk of response) {
        controller.enqueue(encoder.encode(chunk.text));
        fullText += chunk.text;
      }

      controller.close();

      if (chatId && typeof chatId === 'string') {
        await saveMessageToDb(chatId, 'model', fullText, MODEL_NAME);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(chatId && { 'X-Chat-Id': chatId }),
      ...(title && { 'X-Chat-Title': title }),
    },
  });
}

/*  */

/**
 * Generates a chat title based on the user's prompt
 * @param prompt The user's initial message/prompt
 * @returns A suitable title for the chat
 */
export function generateChatTitle(prompt: string): string {
  const maxTitleLength = 30;
  let title = prompt.trim().substring(0, maxTitleLength);

  if (title.length === maxTitleLength && prompt.length > maxTitleLength) {
    const lastSpaceIndex = title.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      title = title.substring(0, lastSpaceIndex);
    }
  }

  if (prompt.length > title.length) {
    title += '...';
  }

  return title || 'New Chat';
}
