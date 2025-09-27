import React from 'react';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
  text?: string;
  fullscreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className,
  text,
  fullscreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    muted: 'text-muted-foreground',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 
            className={cn(
              'animate-spin',
              sizeClasses[size],
              colorClasses[color],
              className
            )}
          />
        );
      
      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-pulse',
                  size === 'sm' && 'h-2 w-2',
                  size === 'md' && 'h-3 w-3',
                  size === 'lg' && 'h-4 w-4',
                  size === 'xl' && 'h-6 w-6',
                  color === 'primary' && 'bg-primary',
                  color === 'secondary' && 'bg-secondary-foreground',
                  color === 'muted' && 'bg-muted-foreground'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className={cn('flex space-x-1 items-end', className)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'animate-pulse rounded-sm',
                  size === 'sm' && 'h-4 w-1',
                  size === 'md' && 'h-6 w-1.5',
                  size === 'lg' && 'h-8 w-2',
                  size === 'xl' && 'h-12 w-3',
                  color === 'primary' && 'bg-primary',
                  color === 'secondary' && 'bg-secondary-foreground',
                  color === 'muted' && 'bg-muted-foreground'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full animate-pulse',
              sizeClasses[size],
              color === 'primary' && 'bg-primary',
              color === 'secondary' && 'bg-secondary-foreground',
              color === 'muted' && 'bg-muted-foreground',
              className
            )}
          />
        );
      
      default:
        return renderLoader();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      text && 'space-y-2'
    )}>
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-sm font-medium',
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = false,
  lines = 1
}) => {
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'skeleton',
              rounded ? 'rounded-full' : 'rounded',
              i === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={{
              width: i === lines - 1 ? '75%' : width,
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'skeleton',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{ width, height }}
    />
  );
};

// Page loader component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader size="xl" variant="spinner" color="primary" />
        <p className="mt-4 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

// Loading overlay for buttons and forms
export const LoadingOverlay: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  text?: string;
}> = ({ loading, children, text }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loader size="md" variant="spinner" color="primary" text={text} />
        </div>
      )}
    </div>
  );
};
