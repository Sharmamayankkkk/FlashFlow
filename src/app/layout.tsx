import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { FlashFlowLogo } from '@/components/icons';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'FlashFlow',
    template: '%s | FlashFlow',
  },
  description: 'An AI-powered GUI for designing, simulating, and executing flash loans on the blockchain. Describe your strategy in natural language and let the AI handle the rest.',
  keywords: ['Flash Loan', 'DeFi', 'AI', 'Smart Contract', 'Solidity', 'Next.js', 'Genkit', 'Blockchain'],
  authors: [{ name: 'Mayank Sharma', url: 'https://github.com/Sharmamayankkkk' }],
  creator: 'Mayank Sharma',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M13 10.25h4.5l-5.25 6v-3.75H8l5.25-6.25v4Z' fill='hsl(240 70% 25%)' stroke='none'/><circle cx='12' cy='12' r='10' stroke='hsl(240 70% 25%)' /></svg>" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
