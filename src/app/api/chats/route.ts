// fetch all chats

import dbConnect from '@/lib/db/dbConnect';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API handler for fetching all chats for a user
 * GET /api/chats
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 }).lean();

    return NextResponse.json(
      chats.map((chat) => ({
        _id: chat._id as string,
        title: chat.title,
        updatedAt: chat.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to load chat history' },
      { status: 500 }
    );
  }
}

/**
 * API handler for deleting all chats for a user
 * DELETE /api/chats
 */
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find all chat IDs for this user
    const chats = await Chat.find({ userId }).select('_id');
    const chatIds = chats.map((chat) => chat._id);

    // Delete all messages from these chats
    await Message.deleteMany({ chatId: { $in: chatIds } });

    // Delete all chats for this user
    await Chat.deleteMany({ userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all chats:', error);
    return NextResponse.json(
      { error: 'Failed to delete chats' },
      { status: 500 }
    );
  }
}
