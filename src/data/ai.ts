import { Message as MessageInterface } from '@/lib/types/shared_types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-2.0-flash';

export async function generateAIResponse(prompt: string, history: MessageInterface[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const formattedHistory = history.map(
    (msg: { role: string; text: string }) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    })
  );

  const aiChat = model.startChat({
    history: formattedHistory,
  });

  const result = await aiChat.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
}

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