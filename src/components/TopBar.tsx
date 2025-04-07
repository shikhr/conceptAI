'use client';

import React, { useState, useEffect } from 'react';
import {
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function TopBar() {
  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to check system preference on mount and setup theme
  useEffect(() => {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      // Use saved preference if it exists
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);

      // Update classes - make sure to remove one and add the other
      if (isDark) {
        document.documentElement.classList.add('dark-mode', 'dark');
        document.documentElement.classList.remove('light-mode');
      } else {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode', 'dark');
      }
    } else {
      // Otherwise check system preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const prefersDark = darkModeQuery.matches;
      setIsDarkMode(prefersDark);

      // Update classes based on system preference
      if (prefersDark) {
        document.documentElement.classList.add('dark-mode', 'dark');
        document.documentElement.classList.remove('light-mode');
      } else {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode', 'dark');
      }

      // Listen for changes in system preference
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark-mode', 'dark');
          document.documentElement.classList.remove('light-mode');
        } else {
          document.documentElement.classList.add('light-mode');
          document.documentElement.classList.remove('dark-mode', 'dark');
        }
      };

      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Function to toggle between light and dark mode
  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);

    // Update the DOM with proper class management
    if (newDarkModeState) {
      document.documentElement.classList.add('dark-mode', 'dark');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode', 'dark');
    }

    // Save preference to localStorage
    localStorage.setItem('theme', newDarkModeState ? 'dark' : 'light');

    // For debugging
    console.log('Theme toggled to:', newDarkModeState ? 'dark' : 'light');
  };

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
        <div className="flex items-center space-x-2">
          <span
            className="text-xl font-bold"
            style={{ color: 'var(--accent-foreground)' }}
          >
            Concept AI
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
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
