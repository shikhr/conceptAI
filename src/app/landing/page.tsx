'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';

import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

export default function Landing() {
  const { isDarkMode, toggleTheme, initTheme } = useThemeStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize theme based on saved preference or system preference
    initTheme();
    // Set visibility for animations
    setIsVisible(true);
  }, [initTheme]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 shadow-sm px-4 sm:px-6 md:px-8 py-4"
        style={{
          backgroundColor: 'var(--card-background)',
          borderBottom: '1px solid var(--card-border)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.svg"
                alt="ConceptAI Logo"
                fill
                sizes="2rem"
                className="object-contain"
              />
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: 'var(--accent-foreground)' }}
            >
              ConceptAI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
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
                <HiOutlineMoon className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-md text-white transition-all"
              style={{ backgroundColor: 'var(--accent-foreground)' }}
            >
              Launch App
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
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
                <HiOutlineMoon className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-sm text-white transition-all"
              style={{ backgroundColor: 'var(--accent-foreground)' }}
            >
              Launch
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="flex-1 flex flex-col justify-center pt-8 md:pt-16 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-4 md:space-y-6"
            >
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: 'var(--foreground)' }}
              >
                Visualize Knowledge with AI
              </h1>
              <p
                className="text-lg md:text-xl"
                style={{ color: 'var(--muted-foreground)' }}
              >
                ConceptAI merges interactive concept mapping with LLM-powered
                learning to help you understand complex topics better.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 md:pt-4">
                <Link
                  href="/"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-md text-base sm:text-lg text-center text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: 'var(--accent-foreground)' }}
                >
                  Start Learning Now
                </Link>
                <a
                  href="https://github.com/shikhr/conceptAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-md text-base sm:text-lg text-center font-medium border transition-transform hover:scale-105"
                  style={{
                    color: 'var(--foreground)',
                    borderColor: 'var(--accent-foreground)',
                  }}
                >
                  View on GitHub
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.9,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-xl overflow-hidden shadow-2xl  sm:block"
              style={{
                backgroundColor: 'var(--card-background)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div className="aspect-video relative">
                {isDarkMode ? (
                  <Image
                    src="/dark_mockup.png"
                    alt="ConceptAI Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // If image fails to load (since it doesn't exist yet)
                      const target = e.target as HTMLImageElement;
                      target.src = '/window.svg';
                      target.className = 'object-contain p-12';
                    }}
                  />
                ) : (
                  <Image
                    src="/light_mockup.png"
                    alt="ConceptAI Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // If image fails to load (since it doesn't exist yet)
                      const target = e.target as HTMLImageElement;
                      target.src = '/window.svg';
                      target.className = 'object-contain p-12';
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section
        className="py-12 md:py-16 px-4 sm:px-8"
        style={{ backgroundColor: 'var(--card-background)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Key Features
            </h2>
            <p
              className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Powerful tools to enhance your learning experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="p-4 md:p-6 rounded-lg"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4"
                  style={{ backgroundColor: 'var(--accent-background)' }}
                >
                  <span
                    className="text-xl md:text-2xl"
                    style={{ color: 'var(--accent-foreground)' }}
                  >
                    {feature.icon}
                  </span>
                </div>
                <h3
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-12 md:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              How ConceptAI Works
            </h2>
            <p
              className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              A simple process to enhance your understanding
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 md:mb-4"
                  style={{
                    backgroundColor: 'var(--accent-background)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  {index + 1}
                </div>
                <h3
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section
        className="py-12 md:py-16 px-4"
        style={{ backgroundColor: 'var(--card-background)' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Ready to Transform Your Learning Experience?
            </h2>
            <p
              className="text-base sm:text-lg md:text-xl mb-6 md:mb-8"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Start building your knowledge network with ConceptAI today.
            </p>
            <Link
              href="/"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-md text-lg sm:text-xl text-white font-medium inline-block transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--accent-foreground)' }}
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 md:py-8 px-4 border-t"
        style={{
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 relative">
              <Image
                src="/file.svg"
                alt="ConceptAI Logo"
                fill
                sizes="1.5rem"
                className="object-contain"
              />
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              ConceptAI
            </span>
          </div>
          <div
            className="text-sm md:text-base"
            style={{ color: 'var(--muted-foreground)' }}
          >
            © {new Date().getFullYear()} ConceptAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature data
const features = [
  {
    icon: '📊',
    title: 'Visual Concept Mapping',
    description:
      'Build and interact with knowledge networks using a dynamic, force-directed graph layout that automatically arranges concepts in a logical structure.',
  },
  {
    icon: '🧠',
    title: 'AI-Powered Learning',
    description:
      'Leverage LLM technology to get intelligent responses to your questions and generate new concepts related to your topics of interest.',
  },
  {
    icon: '🔄',
    title: 'Real-time Interaction',
    description:
      'Experience a seamless, interactive learning process where your knowledge network grows in real-time as you explore new concepts.',
  },
];

// How it works steps
const steps = [
  {
    title: 'Ask a Question',
    description:
      'Start by asking about any concept or topic you want to learn about.',
  },
  {
    title: 'Get AI Response',
    description:
      'Receive a detailed explanation powered by advanced language models.',
  },
  {
    title: 'View Knowledge Graph',
    description:
      'See how concepts connect in an interactive visual representation.',
  },
  {
    title: 'Expand Your Knowledge',
    description:
      'Continue exploring related concepts to build a comprehensive understanding.',
  },
];
