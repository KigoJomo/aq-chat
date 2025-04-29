import type { Metadata } from 'next';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Roboto, Lexend } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Button from '@/shared/components/ui/Button';
import Header from '@/shared/components/navigation/Header';
import SideBar from '@/shared/components/navigation/SideBar';
import ChatInput from './(home)/components/ChatInput';
import { ChatProvider } from '@/context/ChatContext';

export const metadata: Metadata = {
  title: 'Aq Chat',
  description: 'Your chatty AI buddy.',
};

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
});

const lexend = Lexend({
  variable: '--font-lex',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${roboto.variable} ${lexend.variable} antialiased overflow-hidden flex`}>
          <ChatProvider>
            <SideBar />
            <main className="w-full max-h-dvh flex flex-col overflow-y-scroll overflow-x-hidden custom-scrollbar">
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
              <section className="flex-1 flex flex-col items-center gap-4">
                {children}
                <ChatInput />
              </section>
            </main>
          </ChatProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
