'use client';

import Link from 'next/link';
import React, { FC, HtmlHTMLAttributes, ReactNode } from 'react';
import { useChatContext } from '@/context/ChatContext';

interface HeaderProps extends HtmlHTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ className = '', children }) => {
  const { chatTitle, newChat } = useChatContext();

  const handleNewChatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    newChat();
  };

  return (
    <header
      className={`
        ${className}
        px-4 py-3 pl-14 md:pl-4 backdrop-blur-3xl
        w-full flex items-center justify-between gap-6
        sticky top-0 z-50
        `}>
      <div className="hidden md:flex">
        <Link
          href={'/'}
          className="flex items-center gap-2"
          onClick={handleNewChatClick}>
          <h4 className='!normal-case'>Aqutte.ai</h4>
        </Link>
      </div>

      {chatTitle && <span className="text-sm">{chatTitle}</span>}

      <div className="auth-components ml-auto md:m-0 flex items-center gap-4">
        {children}
      </div>
    </header>
  );
};

export default Header;
