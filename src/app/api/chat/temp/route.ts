import { NextRequest, NextResponse } from 'next/server';
import { Message as MessageInterface } from '@/lib/types/shared_types';
import { generateAIResponse } from '@/data/ai';
import chalk from 'chalk';

export async function POST(req: NextRequest) {
  const { prompt, history, modelName } = await req.json();

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

  console.log(chalk.blue(`Model: ${modelName}`));

  return generateAIResponse({
    prompt: prompt,
    history: chatHistory,
    ...(modelName && { modelName: modelName }),
  });
}
