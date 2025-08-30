import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vibe Write - Share Your Thoughts',
  description: 'A platform for developers to share insights, learn from others, and build their professional network.',
  keywords: ['development', 'blog', 'technology', 'programming', 'web development'],
  authors: [{ name: 'Vibe Write Team' }],
  openGraph: {
    title: 'Vibe Write - Share Your Thoughts',
    description: 'A platform for developers to share insights, learn from others, and build their professional network.',
    type: 'website',
    locale: 'en_US',
    images:['/og.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Write - Share Your Thoughts',
    description: 'A platform for developers to share insights, learn from others, and build their professional network.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
