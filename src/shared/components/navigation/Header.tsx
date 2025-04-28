'use client';

import Link from 'next/link';
import React, { FC, HtmlHTMLAttributes, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps extends HtmlHTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ className = '', children }) => {
  const router = useRouter();

  const handleNewChatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <header
      className={`
        ${className}
        p-4 pl-14 md:pl-4 backdrop-blur-3xl
        flex items-center justify-between gap-6
        sticky top-0 z-50
        `}>
      <div className="hidden md:flex">
        <Link
          href={'/'}
          className="flex items-center gap-2"
          onClick={handleNewChatClick}>
          <h4>aq chat</h4>
        </Link>
      </div>

      <div className="auth-components flex items-center gap-4">{children}</div>
    </header>
  );
};

export default Header;
