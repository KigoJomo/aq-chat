'use client';

import Link from 'next/link';
import { FC, HtmlHTMLAttributes, ReactNode } from 'react';
import { useChat } from '@/store/ChatStore';

interface HeaderProps extends HtmlHTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ className = '', children }) => {
  const { title, clearChat } = useChat()

  return (
    <header
      className={`
        ${className}
        p-4 pl-14 md:pl-4 backdrop-blur-3xl
        flex items-center justify-between gap-6
        sticky top-0 z-50
        `}>
      <div className="hidden md:flex">
        <Link href={'/chat'} className="flex items-center gap-2" onClick={clearChat}>
          <h4>aq chat</h4>
        </Link>
      </div>

      <span>{title}</span>

      <div className="auth-components flex items-center gap-4">
        {children}
      </div>
    </header>
  );
};

export default Header