import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RouteProgress from '@/components/RouteProgress';
import { clerkAppearance } from '@/lib/clerk-appearance';

const display = Inter({ subsets: ['latin'], variable: '--f-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--f-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--f-mono', display: 'swap' });

export const metadata = {
  title: {
    default: 'Buncho: AI engineering interview practice',
    template: '%s | Buncho',
  },
  description:
    'Practice AI, ML and GenAI engineer interview questions. Write or speak your answer, then compare it with a reference solution.',
};

// Runs before first paint so the page never flashes the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('buncho-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="flex min-h-dvh flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
          >
            Skip to content
          </a>
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}