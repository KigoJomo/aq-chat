import 'server-only';

import dbConnect from '@/lib/db/dbConnect';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import {
  Chat as ChatInterface,
  Message as MessageInterface,
} from '@/lib/types/shared_types';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function createNewChat(
  title: string
): Promise<ChatInterface | NextResponse<{ error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  }

  await dbConnect();

  const newChat = new Chat({
    userId,
    title: title,
  });

  return await newChat.save();
}

export async function getChatHistory(chatId: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return NextResponse.json({ error: 'Inavlid chat id' }, { status: 400 });
  }

  try {
    await dbConnect();

    const existingChat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages: MessageInterface[] = await Message.find({ chatId });

    return messages;
  } catch (error) {
    console.error('Error loading chat:', error);
    return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 });
  }
}

export async function deleteChat(chatId: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'Inavlid chat id' }, { status: 400 });
  }

  await dbConnect();

  // First verify that the chat belongs to the user
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Delete all messages associated with the chat
  await Message.deleteMany({ chatId });

  // Delete the chat itself
  await Chat.deleteOne({ _id: chatId });

  return NextResponse.json({ success: true });
}

export async function updateTitle(chatId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'Inavlid chat id' }, { status: 400 });
  }

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Inavlid Title' }, { status: 400 });
  }

  await dbConnect();

  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId, userId },
    { title },
    { new: true }
  );

  if (!updatedChat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json(updatedChat);
}

export async function getChatAndHistory(chatId: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'Inavlid chat id' }, { status: 400 });
  }

  await dbConnect();

  const chat = await Chat.findOne({
    _id: chatId,
    userId,
  }).lean();

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();

  return NextResponse.json({
    chat: chat,
    chatHistory: messages,
  });
}

export async function getAllChats() {
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
}

export async function deleteAllChats() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  await dbConnect();

  const chats = await Chat.find({ userId }).select('_id');
  const chatIds = chats.map((chat) => chat._id);

  await Message.deleteMany({ chatId: { $in: chatIds } });

  await Chat.deleteMany({ userId });

  return NextResponse.json({ success: true });
}
