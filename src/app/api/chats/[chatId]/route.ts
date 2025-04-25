import { deleteChat, updateTitle } from '@/data/chat';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API handler for deleting a specific chat
 * DELETE /api/chats/[chatId]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    await deleteChat(chatId)
  } catch (error) {
    console.error(`Error deleting chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * API handler for updating a chat title
 * PATCH /api/chats/[chatId]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const { title } = await req.json();

    await updateTitle(chatId, title)
  } catch (error) {
    console.error(`Error updating chat: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
