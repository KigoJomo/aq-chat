import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createNewChat, getChatHistory, saveMessageToDb } from '../actions/db';
import { generateAIResponse, generateChatTitle } from '../actions/ai';
import {
  Message as MessageInterface,
  Chat as ChatInterface,
} from '@/lib/types/shared_types';
import Chat from '@/models/Chat';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const { prompt, chatId } = await req.json();
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

    let chatHistory: MessageInterface[] = [];
    const isNewChat = !chatId;

    // If chatId provided, verify it exists and belongs to user
    if (chatId) {
      try {
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return NextResponse.json(
            { error: 'Invalid chat ID' },
            { status: 400 }
          );
        }

        // Check if chat exists and belongs to user
        const existingChat = await Chat.findOne({ _id: chatId, userId }).lean();
        if (!existingChat) {
          return NextResponse.json(
            { error: 'Chat not found' },
            { status: 404 }
          );
        }

        // Get chat history for context
        chatHistory = await getChatHistory(chatId);
      } catch (error) {
        console.error('Error validating chat:', error);
        return NextResponse.json(
          { error: 'Failed to load chat' },
          { status: 500 }
        );
      }
    }

    // Generate AI response - do this first for better UX
    const aiResponse: string | NextResponse<{ error: string }> =
      await generateAIResponse(prompt, chatHistory);

    if (typeof aiResponse !== 'string') {
      // If aiResponse is already a NextResponse with an error
      return aiResponse;
    }

    // After getting AI response, handle database operations
    let responseData = {};

    // For new chats, create a chat entry
    if (isNewChat) {
      try {
        const chatTitle = generateChatTitle(prompt);
        const newChat: ChatInterface = await createNewChat(userId, chatTitle);

        // Save user message
        const userMessage = await saveMessageToDb(newChat._id!, 'user', prompt);

        // Save AI response
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
        // Still return the AI response even if DB operations failed
        return NextResponse.json(
          {
            isNewChat: true,
            aiResponse,
            error: 'Chat created but failed to save messages',
          },
          { status: 207 }
        ); // 207 Multi-Status - partial success
      }
    } else {
      // For existing chats, just save the messages
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
        // Still return the AI response even if DB operations failed
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
