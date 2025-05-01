export enum AiModel {
  GEMINI_2_0_FLASH = 'gemini-2.0-flash',
  GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',
  GEMINI_2_0_PRO = 'gemini-2.0-pro',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash',
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
}

export const modelDisplayNames: { [key in AiModel]: string } = {
  [AiModel.GEMINI_2_0_FLASH]: 'Gemini 2.0 Flash',
  [AiModel.GEMINI_2_0_FLASH_LITE]: 'Gemini 2.0 Flash Lite',
  [AiModel.GEMINI_2_0_PRO]: 'Gemini 2.0 Pro',
  [AiModel.GEMINI_2_5_FLASH]: 'Gemini 2.5 Flash',
  [AiModel.GEMINI_2_5_PRO]: 'Gemini 2.5 Pro',
};

export type Role = 'user' | 'model';

export interface Attachment {
  _id?: string;
  type?: 'image' | 'file';
  url: string;
}

export interface Message {
  _id?: string;
  chatId?: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp?: Date;
  modelName?: string;
}

export interface Chat {
  _id?: string;
  userId?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}
