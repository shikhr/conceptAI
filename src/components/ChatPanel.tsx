'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMediaQuery } from '../hooks/useMediaQuery'; // We'll create this hook

interface Message {
  role: string;
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use a custom hook that handles SSR properly
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus on input field when no messages
  useEffect(() => {
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Function to extract content within <Response> tags
  const extractResponse = (content: string) => {
    const responseMatch = content.match(/<Response>([\s\S]*?)<\/Response>/);
    // If response is found within tags, trim and return it
    // Otherwise, check if content itself is already formatted (doesn't have tags)
    return responseMatch ? responseMatch[1].trim() : content;
  };

  // Function to extract content within <Query> tags for display
  const extractQuery = (content: string) => {
    const queryMatch = content.match(/<Query>([\s\S]*?)<\/Query>/);
    return queryMatch ? queryMatch[1].trim() : content;
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex-1 overflow-y-auto ${
          isMobile ? 'mb-2 p-2' : 'mb-4 p-4'
        } rounded-lg shadow`}
        style={{ backgroundColor: 'var(--card-background)' }}
      >
        {messages.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="text-base md:text-base">
              Start a conversation with the AI Tutor
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-center'
                }`}
              >
                <div
                  className={`p-2 md:p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'rounded-br-none max-w-[80%]'
                      : 'rounded-bl-none max-w-none'
                  }`}
                  style={{
                    backgroundColor:
                      message.role === 'user'
                        ? 'var(--accent-foreground)'
                        : 'var(--muted-background)',
                    color:
                      message.role === 'user'
                        ? 'white'
                        : 'var(--card-foreground)',
                  }}
                >
                  {message.role === 'assistant' ? (
                    <div className="max-w-5xl prose prose-slate dark:prose-invert prose-sm md:prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {extractResponse(message.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm md:text-base">
                      {extractQuery(message.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2"
          style={
            {
              backgroundColor: 'var(--card-background)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--card-border)',
              '--tw-ring-color': 'var(--accent-foreground)',
            } as React.CSSProperties
          }
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 md:p-3 rounded-lg transition-colors focus:outline-none focus:ring-2"
          style={
            {
              backgroundColor: !input.trim()
                ? 'var(--accent-background)'
                : 'var(--accent-foreground)',
              color: !input.trim() ? 'var(--muted-foreground)' : 'white',
              '--tw-ring-color': 'var(--accent-foreground)',
            } as React.CSSProperties
          }
        >
          <PaperAirplaneIcon className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </form>
    </div>
  );
}
