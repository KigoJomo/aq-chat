import { NextRequest, NextResponse } from 'next/server';
import { Message as MessageInterface } from '@/lib/types/shared_types';
import { generateAIResponse } from '@/data/ai';

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt must not be empty.' },
      { status: 400 }
    );
  }

  let chatHistory: MessageInterface[] = [];

  if (history) {
    chatHistory = history;
  }

  return generateAIResponse(prompt, chatHistory);
}