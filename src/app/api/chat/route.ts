/**
 * Handles POST requests for chat functionality.
 * Creates a new chat or continues an existing one based on provided chatId.
 *
 * @param req - The Next.js request object containing prompt and optional chatId
 * @returns {Promise<NextResponse>} JSON response containing AI generated response or error message
 *
 * @throws {NextResponse} 400 - If prompt is missing
 * @throws {NextResponse} 500 - If unexpected error occurs during processing
 *
 * Request body:
 * - prompt: string (required) - The user's input message
 * - chatId: string (optional) - ID of existing chat to continue conversation
 *
 * Flow:
 * 1. Creates new chat if no chatId provided
 * 2. Retrieves chat history if chatId exists
 * 3. Generates and returns AI response
 */
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

    let title: string | undefined;
    let currentChatId;
    let history: MessageInterface[] = [];

    if (!chatId) {
      const newChat = await createNewChat(generateChatTitle(prompt));
      if (newChat instanceof NextResponse) {
        return newChat;
      }
      currentChatId = newChat._id;
      title = newChat.title;
    } else {
      const hist = await getChatHistory(chatId);
      if (hist instanceof NextResponse) return hist;
      currentChatId = chatId;
      history = hist;
    }

    const savedMessage = await saveMessageToDb(currentChatId!, 'user', prompt);
    if (savedMessage instanceof NextResponse) {
      return savedMessage;
    }

    return generateAIResponse(prompt, history, currentChatId, title);
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
