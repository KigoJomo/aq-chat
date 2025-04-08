'use client';

import ChatInput from './components/ChatInput';
import ChatIntro from './components/ChatIntro';

export default function DefaultChat() {
  return (
    <section className="h-full flex flex-col">
      <ChatIntro />
      <ChatInput />
    </section>
  );
}
