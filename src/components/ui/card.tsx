import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn('bg-white dark:bg-neutral-800 rounded-lg shadow-soft border border-neutral-200 dark:border-neutral-700 overflow-hidden', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardProps) => {
  return (
    <div className={cn('p-6 border-b border-neutral-200 dark:border-neutral-700', className)}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className }: CardProps) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className }: CardProps) => {
  return (
    <div className={cn('p-6 border-t border-neutral-200', className)}>
      {children}
    </div>
  );
};
