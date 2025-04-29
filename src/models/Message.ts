// src/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: Schema.Types.ObjectId;
  role: 'user' | 'model';
  text: string;
  attachments?: Array<{ url: string; type?: string }>;
  timestamp: Date;
  modelName?: string;
}

export const MessageSchema: Schema<IMessage> = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  attachments: [
    {
      url: { type: String },
      type: { type: String, enum: ['image', 'file'] },
    },
  ],
  timestamp: { type: Date, default: Date.now },
  modelName: { type: String },
});

// MessageSchema.index({ chatId: 1, timestamp: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>('Message', MessageSchema);
