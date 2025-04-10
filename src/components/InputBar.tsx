'use client';

import { useState, useRef, useEffect } from 'react';
import { PiChat, PiGraph, PiPaperPlaneRightBold } from 'react-icons/pi';

interface InputBarProps {
  onSubmit: (message: string) => void;
  toggleMobileView?: () => void;
  activeView?: 'chat' | 'graph';
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function InputBar({
  onSubmit,
  toggleMobileView,
  activeView,
  placeholder = 'Ask a question...',
  autoFocus = false,
  className = '',
}: InputBarProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus on input field if requested
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-3 flex items-center gap-3 rounded-lg m-2 mt-0 transition-all duration-200 ${className}`}
      style={{
        backgroundColor: 'var(--input-background)',
        border: `1px solid ${
          isFocused ? 'var(--accent-foreground)' : 'var(--card-border)'
        }`,
        boxShadow: isFocused ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 py-2 px-3 text-sm md:text-base focus:outline-none transition-colors"
        style={{
          backgroundColor: 'var(--input-background)',
          color: 'var(--card-foreground)',
        }}
      />
      {/* Toggle button - only visible on mobile */}
      {toggleMobileView && activeView && (
        <button
          type="button"
          onClick={toggleMobileView}
          className="p-2 md:hidden rounded-lg transition-all hover:opacity-80 focus:outline-none"
          style={{
            backgroundColor: 'var(--accent-foreground)',
            color: 'white',
          }}
          aria-label={`Switch to ${activeView === 'chat' ? 'Graph' : 'Chat'}`}
        >
          {activeView === 'chat' ? <PiGraph /> : <PiChat />}
        </button>
      )}
      <button
        type="submit"
        disabled={!input.trim()}
        className="p-2.5 md:p-3 rounded-lg transition-all hover:opacity-90 focus:outline-none disabled:opacity-50"
        style={{
          backgroundColor: !input.trim()
            ? 'var(--accent-background)'
            : 'var(--accent-foreground)',
          color: !input.trim() ? 'var(--muted-foreground)' : 'white',
        }}
      >
        <PiPaperPlaneRightBold className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </form>
  );
}
