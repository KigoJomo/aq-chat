// fetch all chats

import dbConnect from '@/lib/db/dbConnect';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
