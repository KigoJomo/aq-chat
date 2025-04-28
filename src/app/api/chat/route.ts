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
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let chatHistory: MessageInterface[] = [];
    const isNewChat = !chatId;

    if (chatId) {
      const response = await getChatHistory(chatId);

      if (response instanceof NextResponse) {
        return response;
      } else {
        chatHistory = response;
      }
    }

    const aiResponse: string | NextResponse<{ error: string }> =
      await generateAIResponse(prompt, chatHistory);

    if (typeof aiResponse !== 'string') {
      return aiResponse;
    }

    let responseData = {};

    if (isNewChat) {
      try {
        const chatTitle = generateChatTitle(prompt);
        const newChat = await createNewChat(chatTitle);

        if (newChat instanceof NextResponse) {
          return newChat;
        }

        const userMessage = await saveMessageToDb(newChat._id!, 'user', prompt);

        const aiMessage = await saveMessageToDb(
          newChat._id!,
          'model',
          aiResponse
        );

        responseData = {
          isNewChat: true,
          aiResponse,
          chat: {
            _id: newChat._id,
            title: newChat.title,
            createdAt: newChat.createdAt,
            updatedAt: newChat.updatedAt,
          },
          messages: {
            user: userMessage.toObject(),
            ai: aiMessage.toObject(),
          },
        };
      } catch (error) {
        console.error('Error creating new chat:', error);
        return NextResponse.json(
          {
            isNewChat: true,
            aiResponse,
            error: 'Chat created but failed to save messages',
          },
          { status: 207 }
        );
      }
    } else {
      try {
        const userMessage = await saveMessageToDb(chatId, 'user', prompt);
        const aiMessage = await saveMessageToDb(chatId, 'model', aiResponse);

        responseData = {
          isNewChat: false,
          aiResponse,
          messages: {
            user: userMessage.toObject(),
            ai: aiMessage.toObject(),
          },
        };
      } catch (error) {
        console.error('Error saving messages:', error);
        return NextResponse.json(
          {
            isNewChat: false,
            aiResponse,
            error: 'Failed to save messages',
          },
          { status: 207 }
        );
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
