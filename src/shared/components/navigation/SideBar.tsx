'use client';

import {
  MessageCirclePlus,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useChat } from '@/store/ChatStore';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import Tooltip from '@/shared/components/ui/Tooltip';
import { Skeleton } from '../ui/Skeleton';
import { useDeviceType } from '../../../hooks/useDeviceType';
import ChatContextMenu from '../ChatContextMenu';
import SettingsModal from '../SettingsModal';

const SideBar: FC = () => {
  const deviceType = useDeviceType();

  const [panelOpen, setPanelOpen] = useState(
    deviceType === 'mobileOrTablet' ? false : true
  );
  const [isMounted, setIsMounted] = useState(false);
  const { sessionId } = useAuth();
  const {
    chatId,
    chats,
    updateId,
    fetchChats,
    clearChat,
    isLoadingChats, // Use the specific loading state
    error,
  } = useChat();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);

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
  }, [sessionId, fetchChats]);

  const togglePanel = () => setPanelOpen(!panelOpen);

  // Modified function to ensure chat state is fully cleared
  const handleNewChatClick = () => {
    setPanelOpen(deviceType === 'mobileOrTablet' ? false : panelOpen);
    clearChat();
    window.location.href = '/chat';
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
          href="/chat"
          onClick={(e) => {
            e.preventDefault();
            handleNewChatClick();
          }}
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
        <div className="w-full max-w-full flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent flex flex-col gap-1">
          {isLoadingChats ? (
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
                onClick={() => {
                  updateId(chat._id!);
                  setPanelOpen(
                    deviceType === 'mobileOrTablet' ? false : panelOpen
                  );
                }}
                className={cn(
                  'w-full max-w-full flex items-center gap-2 p-2 rounded-lg',
                  'text-sm transition-colors duration-200',
                  'hover:bg-accent/10 group relative',
                  'overflow-x-visible',
                  chat._id === chatId
                    ? 'bg-accent/15 text-foreground font-medium'
                    : 'text-foreground/60',
                  panelOpen ? 'px-3' : 'justify-center'
                )}>
                {panelOpen ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-accent/50 shrink-0" />
                    <span className="truncate">{chat.title}</span>

                    {/* Add menu button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveChatMenu(chat._id || null);
                      }}
                      className="chat-menu-trigger ml-auto opacity-0 group-hover:opacity-100 
             hover:bg-foreground/10 p-1 rounded-md transition-all duration-200">
                      <MoreVertical className="w-4 h-4 text-foreground" />
                    </button>

                    {/* Render context menu if this chat is active */}
                    {activeChatMenu === chat._id && (
                      <div className="absolute right-0 top-0">
                        <ChatContextMenu
                          chat={chat}
                          onClose={() => setActiveChatMenu(null)}
                        />
                      </div>
                    )}
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
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            'w-full flex items-center gap-2 p-2 rounded-xl',
            'text-sm transition-colors duration-200 hover:bg-accent/15',
            panelOpen ? 'px-3' : 'justify-center'
          )}>
          <Settings className="w-5 h-5 text-foreground/75 shrink-0" />
          {panelOpen && (
            <span className="text-foreground/75 truncate">Settings</span>
          )}
        </button>
      </aside>

      <div
        onClick={togglePanel}
        className={`inset-0 absolute md:hidden bg-background z-[55] ${
          panelOpen
            ? 'opacity-80 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } transition-all duration-300`}></div>

      <button
        onClick={() => {
          setPanelOpen(deviceType === 'mobileOrTablet' ? false : panelOpen)
          togglePanel();
        }}
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default SideBar;
