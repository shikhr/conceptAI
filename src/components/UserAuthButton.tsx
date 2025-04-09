'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserAuthButton() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
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
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700">
          <div className="px-4 py-2 border-b dark:border-gray-700">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
