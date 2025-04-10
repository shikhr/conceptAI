'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import InputBar from './InputBar';

interface Message {
  role: string;
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  activeView?: 'chat' | 'graph';
  toggleMobileView?: () => void;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  activeView,
  toggleMobileView,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to extract content within <Response> tags
  const extractResponse = (content: string) => {
    const responseMatch = content.match(/<Response>([\s\S]*?)<\/Response>/);
    return responseMatch ? responseMatch[1].trim() : content;
  };

  // Function to extract content within <Query> tags for display
  const extractQuery = (content: string) => {
    const queryMatch = content.match(/<Query>([\s\S]*?)<\/Query>/);
    return queryMatch ? queryMatch[1].trim() : content;
  };

  return (
    <div
      className="flex flex-col h-full "
      style={{ backgroundColor: 'var(--card-background)' }}
    >
      <div
        className="flex-1 overflow-y-auto p-2 md:p-4"
        style={{ backgroundColor: 'var(--card-background)' }}
      >
        {messages.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="text-base">
              Start a conversation with the AI Tutor
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-2 md:p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'rounded-br-none max-w-[80%]'
                      : 'rounded-bl-none max-w-[90%] md:max-w-none'
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

      <InputBar
        onSubmit={onSendMessage}
        toggleMobileView={toggleMobileView}
        activeView={activeView}
        autoFocus={messages.length === 0}
      />
    </div>
  );
}
