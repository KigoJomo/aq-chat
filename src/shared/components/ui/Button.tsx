import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'outline' | "danger";
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  variant = 'primary',
  size = 'default',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  // Define base styles
  const baseStyles =
    'flex items-center justify-center font-medium rounded-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 cursor-pointer';

  // Define variant styles
  const variantStyles = {
    primary: 'bg-foreground text-background hover:bg-foreground-light',
    outline:
      'bg-transparent border border-foreground-light/40 text-foreground hover:bg-background-light',
    danger: 'bg-red-500 text-background hover:bg-red-600',
  };

  // Define size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-1',
    default: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  // Combine styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href}>
        <button
          type={type}
          className={buttonStyles}
          onClick={onClick}
          {...props}>
          {children}
        </button>
      </Link>
    );
  }

  // Otherwise, render as button
  return (
    <button type={type} className={buttonStyles} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;