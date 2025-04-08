import type { Metadata } from 'next';
import './globals.css';
import StoreHydrator from '@/components/StoreHydrator';

export const metadata: Metadata = {
  title: 'Concept AI',
  description: 'An interactive learning tool with concept graph visualization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <StoreHydrator>{children}</StoreHydrator>
      </body>
    </html>
  );
}
