'use client';

import { Sparkles } from 'lucide-react';
import { FC } from 'react';
import Link from 'next/link';
import SigninGit from '../components/SiginInGit';
import SigninGoogle from '../components/SiginInGoogle';

const LoginPage: FC = () => {
  return (
    <section className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-[350px] animate-fade-in-up">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-down">
            <Sparkles size={24} className="stroke-accent" />
            <h3 className="">chatty</h3>
            <div className="h-12 w-[2px] mx-6 bg-background-light"></div>
            <h4>Login</h4>
          </div>

          <hr />

          <div className="flex flex-col gap-4 animate-fade-in-up animation-delay-200">
            <SigninGoogle/>

            <SigninGit />
          </div>

          <hr />

          <div className="flex justify-center items-center gap-0 text-sm animate-fade-in-up animation-delay-500">
            <span className="text-foreground-light">
              Don&apos;t have an account?
            </span>
            <Link
              href="/signup"
              className="text-accent hover:bg-accent/10 px-2 py-1 rounded transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
