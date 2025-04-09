import { ReactNode } from 'react';
import ChatInput from './components/ChatInput';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex-1 flex flex-col">
      {children}
      <ChatInput />
    </section>
  );
}
