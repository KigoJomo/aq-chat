import { deleteAllChats, getAllChats } from '@/data/chat';
import { NextResponse } from 'next/server';

/**
 * API handler for fetching all chats for a user
 * GET /api/chats
 */
export async function GET() {
  try {
    return getAllChats();
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
    return deleteAllChats();
  } catch (error) {
    console.error('Error deleting all chats:', error);
    return NextResponse.json(
      { error: 'Failed to delete chats' },
      { status: 500 }
    );
  }
}
