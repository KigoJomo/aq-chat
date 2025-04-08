export interface Attachment{
  // type: 'image' | 'file'
  url: string
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[]
  // probaly should indicate which model gave the output
  model?: string
}

export interface ChatData{
  id: string
  title: string
  chatHistory: Message[]
}