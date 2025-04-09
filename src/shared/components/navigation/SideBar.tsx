'use client';

import {
  Github,
  MessageCirclePlus,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
} from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useChat } from '@/store/ChatStore';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import Tooltip from '@/shared/components/ui/Tooltip';
import { Skeleton } from '../ui/Skeleton';

const SideBar: FC = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { sessionId } = useAuth();
  const {
    chatId,
    chats,
    updateId,
    fetchChats,
    clearChat,
    isLoading: isChatsLoading,
    error,
  } = useChat();

  // Persist panel state in localStorage
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

  useEffect(() => {
    if (sessionId) {
      fetchChats();
    }
  }, [sessionId]);

  const togglePanel = () => setPanelOpen(!panelOpen);

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

        {/* New Chat Button */}
        <Link
          href="/chat"
          onClick={clearChat}
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
        {/* Chat List */}
        <div className="w-full flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
          {isChatsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 mb-2 bg-foreground/5 rounded-lg"
              />
            ))
          ) : error ? (
            <div className="text-center p-4 text-sm text-red-500">
              Failed to load chats
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center p-4 text-sm text-foreground/50">
              {panelOpen && 'No chat history'}
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                onClick={() => updateId(chat._id!)}
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded-lg',
                  'text-sm transition-colors duration-200',
                  'hover:bg-accent/10',
                  chat._id === chatId
                    ? 'bg-accent/15 text-accent font-medium'
                    : 'text-foreground/75',
                  panelOpen ? 'px-3' : 'justify-center'
                )}>
                {panelOpen ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-accent/50 shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </>
                ) : (
                  <Tooltip content={chat.title} position="right">
                    <span className="w-2 h-2 rounded-full bg-accent/50" />
                  </Tooltip>
                )}
              </Link>
            ))
          )}
        </div>
        {/* GitHub Link */}
        <Link
          href="https://github.com/KigoJomo/aq-chat/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'w-full flex items-center gap-2 p-2 rounded-xl',
            'text-sm transition-colors duration-200 hover:bg-accent/15',
            panelOpen ? 'px-3' : 'justify-center'
          )}>
          <Github className="w-5 h-5 text-foreground/75 shrink-0" />
          {panelOpen && (
            <>
              <span className="text-foreground/75 truncate">GitHub Repo</span>
              <ExternalLink className="w-4 h-4 ml-auto text-foreground/50" />
            </>
          )}
        </Link>
      </aside>

      <div
        onClick={togglePanel}
        className={`inset-0 absolute md:hidden bg-background z-[55] ${
          panelOpen ? 'opacity-80 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } transition-all duration-300`}></div>

      <button
        onClick={togglePanel}
        className={`flex md:hidden absolute top-4 left-4 z-[60] p-1.5 rounded-lg hover:bg-accent/10 ${panelOpen? 'opacity-0' : 'opacity-100'} transition-all duration-300`}
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
