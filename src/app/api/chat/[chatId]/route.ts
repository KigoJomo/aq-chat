import { deleteChat, getChatAndHistory, updateTitle } from '@/data/chat';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API handler for retrieving a chat and message history
 * PATCH /api/chat/[chatId]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    return await getChatAndHistory(chatId);
  } catch (error) {
    console.error(`Error fetching chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * API handler for updating a chat title
 * PATCH /api/chat/[chatId]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const { title } = await req.json();

    return await updateTitle(chatId, title);
  } catch (error) {
    console.error(`Error updating chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * API handler for deleting a specific chat
 * DELETE /api/chat/[chatId]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    return await deleteChat(chatId);
  } catch (error) {
    console.error(`Error deleting chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
