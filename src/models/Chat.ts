// src/models/Chat.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema<IChat> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat ||
  mongoose.model<IChat>('Chat', ChatSchema);