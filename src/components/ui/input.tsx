import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full min-h-[44px] px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 break-words">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
