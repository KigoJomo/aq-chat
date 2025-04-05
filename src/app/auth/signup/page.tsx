'use client';

import { Sparkles } from 'lucide-react';
import { FC, useState } from 'react';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Link from 'next/link';

const SignupPage: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup submission
    console.log('Signup submitted:', formData);
  };

  return (
    <section className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-[350px] animate-fade-in-up">
        <form className="flex flex-col gap-6 p-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-down">
            <Sparkles size={24} className="stroke-accent" />
            <h3 className="">chatty</h3>
            <div className="h-12 w-[2px] mx-6 bg-background-light"></div>
            <h4>Sign Up</h4>
          </div>

          <hr />

          <div className="flex flex-col gap-4 animate-fade-in-up animation-delay-200">
            <Input
              type="text"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="mb-2"
            />

            <Input
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="mb-2"
            />

            <Input
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="mb-2"
            />

            <Input
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="mb-2"
            />

            <div className="flex items-center mt-2 animate-fade-in-up animation-delay-300">
              <Input
                type="checkbox"
                label="I agree to the Terms & Conditions"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mb-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="mt-2 animate-fade-in-up animation-delay-400">
            Sign up
          </Button>

          <div className="flex justify-center items-center gap-2 text-sm animate-fade-in-up animation-delay-500">
            <span className="text-foreground-light">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="text-accent hover:bg-accent/10 px-2 py-1 rounded transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignupPage;
