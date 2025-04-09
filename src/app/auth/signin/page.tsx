'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <FaGoogle className="mr-2" />
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-gray-800 dark:bg-gray-700 rounded-md hover:bg-gray-900 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <FaGithub className="mr-2" />
            <span>Sign in with GitHub</span>
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    </div>
  );
}
