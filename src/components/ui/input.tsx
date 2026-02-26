import { cn } from '@/lib/cn';
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-2 border-brand-burgundy/30 bg-white px-4 py-2 text-sm transition-all',
          'placeholder:text-brand-burgundy/40',
          'focus:border-brand-red focus:ring-2 focus:ring-brand-coral/20 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-brand-darkPurple dark:border-brand-burgundy/50 dark:text-white',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
