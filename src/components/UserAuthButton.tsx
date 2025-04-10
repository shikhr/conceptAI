'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserAuthButton() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    // Only add the event listener if the dropdown is open
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setShowDropdown(false);
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleSignIn}
        className="px-4 py-2 text-white rounded-md text-sm transition-colors"
        style={{ backgroundColor: 'var(--accent-foreground)' }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex items-center space-x-2">
          {user?.image ? (
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={user.image}
                alt={`${user.name}'s profile picture`}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--accent-foreground)' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-48 py-2 rounded-md shadow-lg z-50 border"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div
            className="px-4 py-2 border-b"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--card-foreground)' }}
            >
              {user?.name}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors"
            style={{
              color: 'var(--card-foreground)',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor =
                'var(--muted-background)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
