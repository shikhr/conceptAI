'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Wrap user query in <Query></Query> tags before sending to API
      const wrappedMessage = `<Query>${input}</Query>`;
      onSendMessage(wrappedMessage);
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
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation with the AI Tutor
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
                  className={` p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none max-w-[80%]'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-slate">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {extractResponse(message.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    extractQuery(message.content)
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
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-blue-500 text-white rounded-lg disabled:bg-blue-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
