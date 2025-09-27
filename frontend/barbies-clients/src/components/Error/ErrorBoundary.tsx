"use client";
import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home, HelpCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReload?: boolean;
  showHomeButton?: boolean;
  title?: string;
  message?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (e.g., Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  private generateEventId = (): string => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Here you would integrate with your error tracking service
    // Example integrations:

    // Sentry
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.withScope((scope) => {
    //   scope.setContext("errorInfo", errorInfo);
    //   scope.setLevel("error");
    //   Sentry.captureException(error);
    // });

    // Custom error reporting
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          eventId: this.state.eventId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch((reportingError) => {
        console.error("Failed to report error:", reportingError);
      });
    } catch (reportingError) {
      console.error("Error reporting failed:", reportingError);
    }
  };

  private handleRetry = () => {
    // Clear error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      eventId: this.state.eventId,
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert("Error details copied to clipboard");
      })
      .catch(() => {
        alert("Failed to copy error details");
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {this.props.title || "Oops! Something went wrong"}
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {this.props.message ||
                "We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue."}
            </p>

            {/* Error ID for support */}
            {this.state.eventId && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Error ID:</strong>{" "}
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                    {this.state.eventId}
                  </code>
                </p>
                <p className="text-xs text-gray-500">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Development error details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-red-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                  🔍 Debug Information (Development Only)
                </summary>
                <div className="text-xs text-red-700 space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs bg-red-100 p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs bg-red-100 p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>

                {this.props.showHomeButton !== false && (
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </button>
                )}
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                {this.props.showReload !== false && (
                  <button
                    onClick={this.handleReload}
                    className="flex-1 text-gray-600 hover:text-gray-800 transition-colors py-2"
                  >
                    Reload Page
                  </button>
                )}

                <button
                  onClick={this.copyErrorDetails}
                  className="flex-1 text-gray-600 hover:text-gray-800 transition-colors py-2"
                >
                  Copy Error Details
                </button>

                <a
                  href="/help"
                  className="flex-1 text-gray-600 hover:text-gray-800 transition-colors py-2 inline-flex items-center justify-center gap-1"
                >
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </a>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Still having trouble?{" "}
                <a
                  href="/contact"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, errorInfo?: any) => {
    // You can use this to manually report errors from functional components
    console.error("Manual error report:", error, errorInfo);

    // Report to your error tracking service
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportingError) {
      console.error("Error reporting failed:", reportingError);
    }
  }, []);

  return { reportError };
}

export default ErrorBoundary;
