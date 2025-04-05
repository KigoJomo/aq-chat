import {
  GoogleGenerativeAI,
  // HarmBlockThreshold,
  // HarmCategory,
} from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-2.0-flash';

export async function POST(req: NextRequest) {
  try {
    const { message, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const formattedHistory = chatHistory.map(
      (msg: { role: string; text: string }) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })
    );

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
