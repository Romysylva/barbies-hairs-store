"use client";
import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h2>

          <p className="text-muted-foreground mb-6">
            We're sorry, but something unexpected happened. Please try again or
            go back to the homepage.
          </p>

          {isDevelopment && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg text-left">
              <h3 className="font-medium text-sm mb-2">
                Error Details (Development):
              </h3>
              <code className="text-xs text-destructive break-all">
                {error.message}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={retry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              leftIcon={<Home className="h-4 w-4" />}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific error fallback for API errors
export const ApiErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
}> = ({ error, retry }) => {
  return (
    <Card className="border-destructive/20">
      <CardContent className="p-6 text-center">
        <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>

        <h3 className="font-medium text-foreground mb-2">
          Failed to load data
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {error.message ||
            "Unable to fetch data from the server. Please check your connection and try again."}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};

// Hook for catching async errors in functional components
export const useErrorHandler = () => {
  return (error: Error) => {
    console.error("Async error:", error);
    // You could integrate with error reporting service here
    throw error; // Re-throw to be caught by error boundary
  };
};

export default ErrorBoundary;
