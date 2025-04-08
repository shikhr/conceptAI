'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Default to false/non-mobile during server-side rendering
  // to ensure consistent output between server and client first render
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Set up the media query once on the client
    const mediaQuery = window.matchMedia(query);

    // Initial check
    setMatches(mediaQuery.matches);

    // Update state when viewport changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for viewport changes
    mediaQuery.addEventListener('change', handler);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}
