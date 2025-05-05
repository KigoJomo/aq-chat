import {
  AiModel,
  Message as MessageInterface,
  modelDisplayNames,
  Role,
} from './types/shared_types';

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

export function getDisplayName(model: AiModel): string {
  return modelDisplayNames[model];
}

/**
 * Sanitizes a header value by stripping out disallowed control characters.
 * @param value The header value to sanitize.
 * @returns A sanitized header value.
 */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}
