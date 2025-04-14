import type { Metadata } from 'next';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Geist, Geist_Mono, Funnel_Display } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Button from '@/shared/components/ui/Button';
import Header from '@/shared/components/navigation/Header';
import SideBar from '@/shared/components/navigation/SideBar';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const funnelDisplay = Funnel_Display({
  variable: '--font-funnel-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Aq Chat',
  description: 'Your chatty AI buddy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${funnelDisplay.variable} antialiased overflow-hidden flex`}>
          <ThemeProvider>
            <SideBar />
            <main className="w-full h-dvh flex flex-col overflow-y-scroll custom-scrollbar">
              <Header>
                <SignedOut>
                  <SignInButton>
                    <Button className="shrink-0" size="sm">
                      <span>Log in</span>
                    </Button>
                  </SignInButton>
                  <div className="shrink-0 hidden md:flex">
                    <SignUpButton>
                      <Button className="shrink-0" variant="outline" size="sm">
                        <span>Sign up</span>
                      </Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </Header>
              {children}
            </main>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
