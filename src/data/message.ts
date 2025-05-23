import { Message as MessageInterface, Role } from '@/lib/types/shared_types';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/dbConnect';
import chalk from 'chalk';

export async function saveMessageToDb(
  chatId: string,
  role: Role,
  text: string,
  modelName?: string
): Promise<MessageInterface | NextResponse> {
  try {
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { error: 'Invalid chat ID format' },
        { status: 400 }
      );
    }

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Message text cannot be empty' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newMessage = new Message({
      chatId,
      role,
      text: text.trim(),
      ...(modelName && { modelName: modelName.trim() }),
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();

    if (!savedMessage) {
      throw new Error('Failed to save message');
    }

    console.log(
      chalk.green(`>>>>> Saved message to db. Role: ${savedMessage.role}`)
    );

    return savedMessage.toObject();
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
