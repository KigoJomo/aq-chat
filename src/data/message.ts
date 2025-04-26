import dbConnect from '@/lib/db/dbConnect';
import { Role } from '@/lib/types/shared_types';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';

export async function saveMessageToDb(
  chatId: string,
  role: Role,
  text: string,
  modelName?: string
) {
  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'Invalid chat' }, { status: 400 });
  }

  if (!text || text === '') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  await dbConnect();

  const newMessage = new Message({
    chatId,
    role,
    text,
    ...(modelName && { modelName }),
  });

  return await newMessage.save()
}
