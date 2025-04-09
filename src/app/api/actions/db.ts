import dbConnect from "@/lib/db/dbConnect";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

import { Message as MessageInterface } from "@/lib/types/shared_types"

export async function createNewChat(userId: string, title: string) {
  await dbConnect();

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