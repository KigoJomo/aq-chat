import { Message as MessageInterface } from '@/lib/types/shared_types';
import { formatHistory, sanitizeHeaderValue } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { saveMessageToDb } from './message';
import chalk from 'chalk';

interface AiResponseParams {
  prompt: string;
  modelName?: string;
  history: MessageInterface[];
  chatId?: string;
  title?: string;
}

export async function generateAIResponse({
  prompt,
  modelName,
  history,
  chatId,
  title,
}: AiResponseParams) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const formattedHistory = formatHistory(history);
  const MODEL_NAME = modelName ? modelName : 'gemini-2.0-flash';

  console.log(chalk.blue(`>>>>> Getting response from ${MODEL_NAME}`));
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

      if (chatId) {
        const savedAiMessage = await saveMessageToDb(
          chatId,
          'model',
          fullText,
          MODEL_NAME
        );

        if (savedAiMessage instanceof NextResponse) return savedAiMessage;
      }
    },
  });

  const safeTitle = title ? sanitizeHeaderValue(title) : undefined;

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(chatId && { 'X-Chat-Id': chatId }),
      ...(title && { 'X-Chat-Title': safeTitle }),
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
