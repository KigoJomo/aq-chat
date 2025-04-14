/**
 * API route handler for retrieving chat and message history
 * 
 * @route GET /api/chat/[chatId]
 * @param {Request} req - The incoming HTTP request object
 * @param {Object} params - Route parameters
 * @param {Promise<{chatId: string}>} params.params - Contains the chat ID from the URL
 * @returns {Promise<NextResponse>} JSON response containing:
 * - On success: {chat: ChatDocument, chatHistory: MessageDocument[]}
 * - On error:
 *   - 401 if user is not authenticated
 *   - 404 if chat is not found
 *   - 500 for internal server errors
 * @throws {Error} When database connection or query fails
 */


import dbConnect from '@/lib/db/dbConnect';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await auth();
    const { chatId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const chat = await Chat.findOne({
      _id: chatId,
      userId,
    }).lean();

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .lean();
    
    return NextResponse.json({
      chat: chat,
      chatHistory: messages
    })
  } catch (error) {
    console.error(`Error fetching chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
