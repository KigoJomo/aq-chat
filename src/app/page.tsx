'use client';

import { Logo } from '@/shared/components/ui/Logo';
import { Check, CopyIcon, LoaderIcon, SendIcon } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '@/shared/components/MarkdownRenderer';
import '@/shared/styles/markdown-highlight.css';

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
  // Add state for tracking copied message
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startWithSuggestion = (suggestion: string) => {
    setInputValue(suggestion);

    if (inputRef.current?.parentElement) {
      inputRef.current.parentElement.dataset.clonedVal = suggestion;
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

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
    const isMobileOrTablet = () => {
      // Check for touch capability
      const hasTouchScreen =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        ('msMaxTouchPoints' in window && 'msMaxTouchPoints' in navigator);

      // Small screen is a secondary indicator
      const isSmallScreen = window.innerWidth <= 768;

      return hasTouchScreen || isSmallScreen;
    };

    // Only submit on Enter (without shift) if it's a desktop device
    if (e.key === 'Enter' && !e.shiftKey && !isMobileOrTablet()) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
    // On mobile/tablet, pressing Enter will create a new line (default behavior)
  };

  // Updated copy to clipboard function with visual feedback
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Update the data attribute for the auto-growing functionality
    if (e.target.parentElement) {
      e.target.parentElement.dataset.clonedVal = e.target.value;
    }
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
    <section className="h-dvh flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Logo />
        <h4 className="">Aq Chat</h4>
      </div>

      {/* Chat messages container */}
      <div className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar md:pr-4 pt-6 pb-12 mt-6 border-t border-foreground-light/25">
        {error && (
          <div className="error fixed top-18 left-0 right-0 mx-auto bg-red-100 border border-red-600 text-red-600 text-xs rounded-md p-4 w-fit z-10">
            <span>{error}</span>
          </div>
        )}

        {chatHistory.length > 0 ? (
          <>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`w-full flex items-start gap-2 ${
                  message.role === 'user'
                    ? 'flex-row-reverse ml-auto'
                    : 'mr-auto'
                }`}>
                <div className="relative group">
                  <div
                    className={`${
                      message.role === 'user'
                        ? 'bg-background-light/100 px-3 py-2 rounded-2xl max-w-80 md:max-w-[36rem]'
                        : 'flex flex-col gap-4'
                    }`}>
                    <MarkdownRenderer
                      content={message.text}
                      className="text-foreground text-sm"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(message.text, index)}
                        className={`
                          ${
                            message.role === 'user'
                              ? 'absolute top-2 right-full mr-2 opacity-0 group-hover:opacity-100'
                              : ''
                          }
                           transition-all cursor-pointer`}
                        aria-label={
                          copiedMessageIndex === index
                            ? 'Copied to clipboard'
                            : 'Copy message'
                        }>
                        {copiedMessageIndex === index ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <CopyIcon size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* loading indicator when waiting for response */}
            {loading && (
              <div className="w-full flex items-start gap-2 mr-auto">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-background-light">
                  <Logo size={16} />
                </div>
                <div className="max-w-[350px] md:max-w-[700px] bg-background-light rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground-light text-sm">
                      Thinking
                    </span>
                    <span className="flex gap-1">
                      <span className="h-2 w-2 bg-foreground-light rounded-full animate-pulse delay-100"></span>
                      <span className="h-2 w-2 bg-foreground-light rounded-full animate-pulse delay-200"></span>
                      <span className="h-2 w-2 bg-foreground-light rounded-full animate-pulse delay-300"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full my-auto flex flex-col items-center gap-4">
            <Logo size={128} className="opacity-50" />
            <div className="text-center">
              <h3 className="text-solid-foreground mb-2">
                Hi 👋, I&apos;m Aq!
              </h3>
              <p className="text-sm mb-6">
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
                    onClick={() => startWithSuggestion(suggestion)}>
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
        className="w-full mt-auto py-3 px-4 bg-background-light border-2 border-transparent shrink-0 rounded-2xl flex flex-col gap-2 focus-within:border-foreground-light/20 transition-all duration-300">
        <div
          className="w-full grid text-sm after:px-2 after:py-1 [&>textarea]:text-inherit after:text-inherit [&>textarea]:resize-none [&>textarea]:overflow-hidden [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] after:whitespace-pre-wrap after:invisible after:content-[attr(data-cloned-val)]"
          data-cloned-val={inputValue}>
          <textarea
            ref={inputRef}
            name="prompt"
            id="prompt"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything ..."
            disabled={loading}
            className="w-full outline-none focus:outline-none bg-transparent px-2 py-1 text-sm"
            rows={1}
          />
        </div>

        <div className="w-full flex items-center justify-between">
          <span className="capitalize text-xs bg-accent/20 px-2 py-1 rounded-full">
            gemini 2.0 flash
          </span>
          <button
            className={`${
              loading || inputValue === ''
                ? 'bg-background-light *:stroke-foreground cursor-not-allowed'
                : 'bg-foreground *:stroke-background hover:bg-foreground-light cursor-pointer'
            } w-fit p-3 rounded-xl flex-shrink-0 transition-all`}
            type="submit"
            disabled={loading || inputValue === ''}>
            {loading ? (
              <LoaderIcon size={16} className="animate-spin" />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
