import { Message as MessageInterface, Role } from './types/shared_types';

export function cn(...inputs: Array<string | boolean | undefined | null>) {
  return inputs.filter(Boolean).join(' ');
}

export function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function formatHistory(chatHistory: MessageInterface[]) {
  return chatHistory.map((msg: { role: Role; text: string }) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }],
  }));
}
