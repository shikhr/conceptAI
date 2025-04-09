'use client';

import React, { useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserAuthButton from './UserAuthButton';

import { useThemeStore } from '../stores/themeStore';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineCog8Tooth,
  HiBars3,
} from 'react-icons/hi2';

interface TopBarProps {
  children?: ReactNode;
  onToggleSidebar?: () => void;
}

export default function TopBar({ children, onToggleSidebar }: TopBarProps) {
  const { isDarkMode, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <header
      className="sticky top-0 z-50 w-full p-2 md:p-3"
      style={{
        backgroundColor: 'var(--card-background)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-full transition-colors mr-2"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label="Toggle sidebar"
          >
            <HiBars3 className="h-5 w-5" />
          </button>
          <Link
            href="/landing"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-5 h-5 md:w-6 md:h-6 relative">
              <Image
                src="/logo.svg"
                alt="ConceptAI Logo"
                fill
                sizes="(max-width: 768px) 1.25rem, 1.5rem"
                className="object-contain"
              />
            </div>
            <span
              className="text-lg md:text-xl font-bold"
              style={{ color: 'var(--accent-foreground)' }}
            >
              Concept AI
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {children}

          <button
            onClick={toggleTheme}
            className="p-1.5 md:p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {isDarkMode ? (
              <HiOutlineSun className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <HiOutlineMoon className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>

          <button
            className="p-1.5 md:p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label="Settings"
          >
            <HiOutlineCog8Tooth className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <UserAuthButton />
        </div>
      </div>
    </header>
  );
}
