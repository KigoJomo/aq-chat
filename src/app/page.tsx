'use client';

import {
  ClipboardCopy,
  LoaderIcon,
  SendIcon,
  Sparkles,
  User,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CHAT_HISTORY_KEY = 'chatty-history';

export default function ChatPage() {
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load chat history from local storage: ', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (error) {
      console.error('Failed to save chat history to local storage: ', error);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Handle keyboard shortcuts for the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: inputValue.trim() };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          chatHistory: chatHistory,
        }),
      });

      console.log('sending request');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      const modelMessage: Message = { role: 'model', text: data.response };
      setChatHistory((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Failed to fetch AI response: ', error);
      const erorrMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${erorrMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 md:gap-4">
      <div className="flex items-center gap-2">
        <Sparkles size={24} className="stroke-accent" />
        <h4 className="text-xl font-semibold">chatty</h4>
      </div>

      <hr className="border-background-light" />

      <div className="w-full h-[65vh] md:h-[72.5vh] rounded-2xl flex flex-col gap-6 overflow-y-auto p-4">
        {error && (
          <div className="error fixed top-18 left-0 right-0 mx-auto bg-red-100 border border-red-600 text-red-600 text-xs rounded-md p-4 w-fit z-10">
            <span>{error}</span>
          </div>
        )}

        {chatHistory.length > 0 ? (
          chatHistory.map((message, index) => (
            <div
              key={index}
              className={`w-full flex items-start gap-2 ${
                message.role === 'user' ? 'flex-row-reverse ml-auto' : 'mr-auto'
              }`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-accent/20'
                    : 'bg-background-light'
                }`}>
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
              </div>
              <div className="relative group">
                <div
                  className={`max-w-[350px] md:max-w-[700px] ${
                    message.role === 'user'
                      ? 'bg-accent/10'
                      : 'bg-background-light'
                  } rounded-2xl p-3`}>
                  <span className="text-foreground text-sm whitespace-pre-wrap">
                    {message.text}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(message.text)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Copy message">
                  <ClipboardCopy size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full my-auto flex flex-col items-center gap-4">
            <Sparkles size={128} className="opacity-10" />
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Welcome to Chatty!</h3>
              <p className="text-sm text-gray-400 mb-6">
                Try asking something to get started
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'What is machine learning?',
                  'Tell me a fun fact',
                  'How do I learn coding?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="bg-background-light hover:bg-background-light/80 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-300"
                    onClick={() => setInputValue(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full py-3 px-4 bg-background-light/20 border-2 border-transparent shrink-0 rounded-2xl flex items-end gap-2 focus-within:border-foreground-light/20 transition-all duration-300">
        <textarea
          name="prompt"
          id="prompt"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask chatty anything... (Press Enter to send)"
          disabled={loading}
          rows={1}
          className="w-full min-h-[40px] max-h-[120px] flex items-end outline-none focus:outline-none resize-none bg-transparent px-2 py-1"
          style={{ overflow: 'auto' }}
        />

        <button
          className={`${
            loading ? 'bg-accent/20' : 'bg-accent'
          } p-3 rounded-xl flex-shrink-0 hover:bg-accent/80 transition-colors`}
          type="submit"
          disabled={loading}>
          {loading ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : (
            <SendIcon size={16} />
          )}
        </button>
      </form>
    </section>
  );
}
