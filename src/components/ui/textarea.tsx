import { cn } from '@/lib/cn';
import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-lg border-2 border-brand-burgundy/30 bg-white px-4 py-3 text-sm transition-all',
          'placeholder:text-brand-burgundy/40',
          'focus:border-brand-red focus:ring-2 focus:ring-brand-coral/20 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-brand-darkPurple dark:border-brand-burgundy/50 dark:text-white',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
