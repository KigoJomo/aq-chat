// src/shared/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, isLoading = true, ...props }, ref) => {
    if (!isLoading) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-foreground/5 rounded-md',
          'data-[type=text]:h-4 data-[type=text]:w-2/3', // Text-type skeleton
          'data-[type=circle]:rounded-full', // Circle-type skeleton
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };