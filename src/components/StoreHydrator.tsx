'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useGraphStore } from '@/stores/graphStore';
import { useThemeStore } from '@/stores/themeStore';

interface StoreHydratorProps {
  children: React.ReactNode;
}

export default function StoreHydrator({ children }: StoreHydratorProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate all stores on client side only
  useEffect(() => {
    // Rehydrate all Zustand persisted stores
    useChatStore.persist.rehydrate();
    useGraphStore.persist.rehydrate();
    useThemeStore.persist.rehydrate();

    // Initialize theme
    useThemeStore.getState().initTheme();

    // Mark as hydrated
    setIsHydrated(true);
  }, []);

  // Shows nothing until the stores are rehydrated
  if (!isHydrated) {
    return null;
  }

  // Once hydrated, render children
  return <>{children}</>;
}
