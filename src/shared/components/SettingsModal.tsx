'use client';

import { FC, useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Trash2,
  LayoutGrid,
  Info,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChat } from '@/store/ChatStore';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme, setTheme } = useTheme(); // Use next-themes
  const { chats, deleteAllChats } = useChat();

  const tabs = [
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'chatManagement',
      label: 'Chats',
      icon: <Trash2 className="w-4 h-4" />,
    },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleDeleteAllChats = () => {
    deleteAllChats();
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-background-light relative rounded-xl border border-foreground-light/30 shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-foreground-light/30">
            <h2 className="font-medium">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-foreground/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-foreground-light/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-foreground/70 hover:text-foreground'
                )}
                onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm">Theme</label>
                  <button
                    onClick={() =>
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'chatManagement' && (
              <div className="space-y-4">
                <p className="text-sm text-foreground/70">
                  You have {chats.length} saved conversations.
                </p>

                <div className="flex gap-2">
                  <motion.button
                    layout
                    onClick={() => setShowDeleteConfirm(true)}
                    className={cn(
                      'flex justify-center items-center gap-2 p-2 rounded-lg',
                      'bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors',
                      showDeleteConfirm ? 'flex-1' : 'w-full'
                    )}>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All Chats</span>
                  </motion.button>

                  <AnimatePresence>
                    {showDeleteConfirm && (
                      <motion.button
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        onClick={handleDeleteAllChats}
                        className="flex-1 flex justify-center items-center gap-2 p-2 rounded-lg 
                                 bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4 text-sm">
                <p>AQ Chat v1.0.0</p>
                <p className="text-foreground/70">
                  An AI chat application built with Next.js and Tailwind CSS.
                </p>
                <div className="pt-2">
                  <a
                    href="https://github.com/KigoJomo/aq-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1">
                    View on GitHub
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
