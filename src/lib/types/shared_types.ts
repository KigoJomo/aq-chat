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
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContextType {
  messages: Message[];
  responding: boolean;
  sendMessage: (prompt: string) => Promise<void>;
}