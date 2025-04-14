'use client';

import React, { FC, useRef, useEffect, useState } from 'react';
import { Pencil, Trash2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '@/store/ChatStore';
import { Chat as ChatInterface } from '@/lib/types/shared_types';
import { cn } from '@/lib/utils';

interface ChatContextMenuProps {
  chat: ChatInterface;
  onClose: () => void;
}

const ChatContextMenu: FC<ChatContextMenuProps> = ({ chat, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(chat.title);
  const { renameChat, deleteChat, exportChat } = useChat();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside menu and not on trigger button
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.chat-menu-trigger')
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Focus input when renaming starts
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (newName.trim() && newName !== chat.title) {
      renameChat(chat._id!, newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.1 }}
      style={{ transformOrigin: 'top right' }}
      className="fixed z-[60] w-48 bg-background-light border border-foreground-light/30 
                rounded-lg shadow-lg py-1 overflow-hidden *:text-foreground/60"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
      {isRenaming ? (
        <div className="p-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRename();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsRenaming(false);
                onClose();
              }
            }}
            maxLength={50}
            className="w-full p-1.5 text-sm bg-background border border-foreground/20 
                     rounded focus:outline-none focus:ring-1 focus:ring-accent
                     placeholder:text-foreground/40"
            placeholder="Enter chat name..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsRenaming(false);
                onClose();
              }}
              className="px-2 py-1 text-xs rounded hover:bg-foreground/10 
                       transition-colors duration-200">
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleRename(e);
              }}
              disabled={!newName.trim() || newName === chat.title}
              className="px-2 py-1 text-xs bg-accent/20 text-accent rounded 
                       hover:bg-accent/30 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed">
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <MenuButton
            icon={<Pencil />}
            label="Rename"
            onClick={(e) => {
              e.preventDefault();
              setIsRenaming(true);
            }}
          />
          <MenuButton
            icon={<Download />}
            label="Export"
            onClick={(e) => {
              e.preventDefault();
              exportChat(chat._id!);
              onClose();
            }}
          />
          <MenuButton
            icon={<Trash2 />}
            label="Delete"
            onClick={(e) => {
              e.preventDefault();
              if (confirm('Are you sure you want to delete this chat?')) {
                deleteChat(chat._id!);
                onClose();
              }
            }}
            className="!text-red-500"
          />
        </>
      )}
    </motion.div>
  );
};

// Add a reusable MenuButton component
interface MenuButtonProps {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const MenuButton: FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  className,
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }}
    className={cn(
      'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
      'hover:bg-foreground/10 transition-colors duration-200',
      className
    )}>
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

export default ChatContextMenu;
