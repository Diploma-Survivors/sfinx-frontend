import type React from 'react';
import './globals.css';
import './styles/editor-theme.css';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { ConditionalLayout } from '@/components/layout';
import { ServerProvider } from '@/components/providers/server-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AppProvider } from '@/contexts/app-context';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SfinX - The AI-first Online Judge',
  description:
    'The AI-First Online Judge for Elite Developers',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ToastProvider>
          <ServerProvider>
            <EmailVerificationBanner />
            <ConditionalLayout>{children}</ConditionalLayout>
          </ServerProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
