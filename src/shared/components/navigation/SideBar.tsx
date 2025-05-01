'use client';

import {
  EllipsisVertical,
  MessageCirclePlus,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { FC, MouseEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Tooltip from '@/shared/components/ui/Tooltip';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { useUser } from '@clerk/nextjs';
import { useChatContext } from '@/context/ChatContext';

const SideBar: FC = () => {
  const { isSignedIn } = useUser();

  const { chatId, newChat, chats, refreshChatList, openChat } =
    useChatContext();

  useEffect(() => {
    if (isSignedIn) {
      refreshChatList();
    }
  }, [isSignedIn, refreshChatList]);

  const deviceType = useDeviceType();
  const [panelOpen, setPanelOpen] = useState(
    deviceType === 'mobileOrTablet' ? false : true
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-open');
    if (savedState) setPanelOpen(savedState === 'true');
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebar-open', String(panelOpen));
    }
  }, [panelOpen, isMounted]);

  const togglePanel = () => setPanelOpen(!panelOpen);

  const handleNewChatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setPanelOpen(deviceType === 'mobileOrTablet' ? false : panelOpen);
    newChat();
  };

  return (
    <>
      <aside
        className={cn(
          'h-dvh bg-background-light',
          'absolute z-[60] md:relative md:max-w-64',
          'transition-all duration-300 ease-in-out',
          'flex flex-col items-start gap-4 p-4',
          'border-r border-foreground-light/50',
          panelOpen
            ? 'w-[260px] left-0 shadow-xl md:shadow-none md:w-full'
            : '-left-full md:left-0 md:w-14'
        )}>
        {/* Header Section */}
        <div className="w-full flex items-center justify-between">
          <Tooltip content={panelOpen ? 'Collapse' : 'Expand'} position="right">
            <button
              onClick={togglePanel}
              className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors"
              aria-label={panelOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
              {panelOpen ? (
                <PanelRightOpen className="w-5 h-5 text-foreground/75" />
              ) : (
                <PanelRightClose className="w-5 h-5 text-foreground/75" />
              )}
            </button>
          </Tooltip>
          {panelOpen && (
            <span className="text-sm font-medium text-foreground/75">
              History
            </span>
          )}
        </div>

        <Link
          href="/"
          onClick={handleNewChatClick}
          className={cn(
            'w-full flex items-center gap-2 p-2 rounded-xl',
            'transition-all duration-200 hover:bg-accent/15',
            panelOpen ? 'px-3' : 'justify-center'
          )}>
          <MessageCirclePlus className="w-5 h-5 text-foreground/75 shrink-0" />
          {panelOpen && (
            <span className="text-sm text-foreground/75 truncate">
              New Chat
            </span>
          )}
        </Link>

        {panelOpen &&
          (isSignedIn ? (
            <div className={cn('w-full flex flex-col gap-2', '')}>
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={cn(
                    'py-2 px-4 w-full flex items-center gap-0',
                    'group rounded-xl transition-all duration-300',
                    chat._id === chatId
                      ? 'bg-background'
                      : 'bg-transparent hover:bg-background/80'
                  )}>
                  <Link
                    href={`/chat/${chat._id}`}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setPanelOpen(
                        deviceType === 'mobileOrTablet' ? false : panelOpen
                      );
                      openChat(chat._id!, chat.title);
                    }}
                    className={cn('text-nowrap truncate text-sm w-full')}>
                    {chat.title}
                  </Link>

                  <button
                    className={cn(
                      'opacity-0 group-hover:opacity-100 transition-all duration-300',
                      'aspect-square px-1 shrink-0 flex items-center justify-center'
                    )}>
                    <EllipsisVertical size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`
          !text-xs !text-foreground-light italic mx-auto my-12 whitespace-nowrap
          ${panelOpen ? 'flex' : 'hidden'}
        `}>
              Log in to save your chats
            </p>
          ))}
      </aside>

      <div
        onClick={togglePanel}
        className={`inset-0 absolute md:hidden bg-background z-[55] ${
          panelOpen
            ? 'opacity-80 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } transition-all duration-300`}></div>

      <button
        onClick={togglePanel}
        className={`flex md:hidden absolute top-4 left-4 z-[60] p-1.5 rounded-lg hover:bg-accent/10 ${
          panelOpen ? 'opacity-0' : 'opacity-100'
        } transition-all duration-300`}
        aria-label={panelOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
        {panelOpen ? (
          <PanelRightOpen className="w-5 h-5 text-foreground/75" />
        ) : (
          <PanelRightClose className="w-5 h-5 text-foreground/75" />
        )}
      </button>
    </>
  );
};

export default SideBar;
