import { create } from 'zustand';
import { ColorMode } from '@xyflow/react';

interface ThemeState {
  // State
  isDarkMode: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Initial state
  isDarkMode: false,

  // Actions
  toggleTheme: () => {
    const newDarkModeState = !get().isDarkMode;

    // Update state
    set({ isDarkMode: newDarkModeState });

    // Apply theme to document
    applyThemeToDocument(newDarkModeState);

    // Save preference to localStorage
    localStorage.setItem('theme', newDarkModeState ? 'dark' : 'light');

    // For debugging
    console.log('Theme toggled to:', newDarkModeState ? 'dark' : 'light');
  },

  setTheme: (isDark: boolean) => {
    // Update state
    set({ isDarkMode: isDark });

    // Apply theme to document
    applyThemeToDocument(isDark);

    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;

    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      // Use saved preference if it exists
      const isDark = savedTheme === 'dark';
      set({ isDarkMode: isDark });
      applyThemeToDocument(isDark);
    } else {
      // Otherwise check system preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const prefersDark = darkModeQuery.matches;
      set({ isDarkMode: prefersDark });
      applyThemeToDocument(prefersDark);

      // Listen for changes in system preference
      const handleChange = (e: MediaQueryListEvent) => {
        set({ isDarkMode: e.matches });
        applyThemeToDocument(e.matches);
      };

      darkModeQuery.addEventListener('change', handleChange);
    }
  },
}));

// Helper function to apply theme to document
function applyThemeToDocument(isDark: boolean) {
  if (typeof document === 'undefined') return;

  if (isDark) {
    document.documentElement.classList.add('dark-mode', 'dark');
    document.documentElement.classList.remove('light-mode');
  } else {
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode', 'dark');
  }
}

// Utility function to get current theme as ColorMode for ReactFlow
export function getColorMode(): ColorMode {
  const isDark = useThemeStore.getState().isDarkMode;
  return isDark ? 'dark' : 'light';
}
