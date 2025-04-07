'use client';

import React, { useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../stores/themeStore';

// Define props interface with optional children
interface TopBarProps {
  children?: ReactNode;
}

export default function TopBar({ children }: TopBarProps) {
  // Use the theme store
  const { isDarkMode, toggleTheme, initTheme } = useThemeStore();

  // Initialize theme on component mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <header
      className="sticky top-0 z-50 w-full p-3"
      style={{
        backgroundColor: 'var(--card-background)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <Link
          href="/landing"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 relative">
            <Image
              src="/logo.svg"
              alt="ConceptAI Logo"
              fill
              sizes="1.5rem"
              className="object-contain"
            />
          </div>
          <span
            className="text-xl font-bold"
            style={{ color: 'var(--accent-foreground)' }}
          >
            Concept AI
          </span>
        </Link>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Additional UI elements passed as children */}
          {children}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Settings Button */}
          <button
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* User Profile */}
          <button
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label="User profile"
          >
            <UserCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
