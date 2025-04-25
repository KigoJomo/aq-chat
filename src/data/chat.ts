import dbConnect from '@/lib/db/dbConnect';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

import {
  Chat as ChatInterface,
  Message as MessageInterface,
} from '@/lib/types/shared_types';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function createNewChat(title: string): Promise<ChatInterface> {
  await dbConnect();

  const { userId } = await auth();

  const newChat = new Chat({
    userId,
    title: title,
  });

  return await newChat.save();
}

export async function saveMessageToDb(
  chatId: string,
  role: 'user' | 'model',
  text: string,
  modelName?: string
) {
  await dbConnect();

  const newMessage = new Message({
    chatId,
    role,
    text,
    ...(modelName && { modelName }),
  });

  return await newMessage.save();
}

export async function getChatHistory(chatId: string) {
  await dbConnect();

  const messages: MessageInterface[] = await Message.find({ chatId });

  return messages;
}

export async function deleteChat(chatId: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
