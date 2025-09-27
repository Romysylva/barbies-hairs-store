import React from 'react';
import { cn } from '../utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'badge',
          {
            'badge-primary': variant === 'primary',
            'badge-secondary': variant === 'secondary',
            'badge-outline': variant === 'outline',
            'badge-destructive': variant === 'destructive',
            'badge-success': variant === 'success',
            'badge-warning': variant === 'warning',
          },
          {
            'px-1.5 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-xs': size === 'md',
            'px-3 py-1 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
