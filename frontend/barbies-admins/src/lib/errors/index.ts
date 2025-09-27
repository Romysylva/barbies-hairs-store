// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

import { ZodError } from "zod";
import { ApiError } from "@/types";

// Custom Error Classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

// Error Handling Functions
export function handleZodError(error: ZodError): ValidationError {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return new ValidationError("Validation failed", errors);
}

export function formatApiError(error: unknown): ApiError {
  // Handle custom app errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.statusCode,
      errors: error instanceof ValidationError ? error.errors : undefined,
    };
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = handleZodError(error);
    return {
      message: validationError.message,
      status: validationError.statusCode,
      errors: validationError.errors,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  // Handle unknown errors
  return {
    message: "An unexpected error occurred",
    status: 500,
  };
}

// Client-side error handling
export function handleClientError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// API Response helpers
export function createErrorResponse(error: unknown, status?: number) {
  const apiError = formatApiError(error);

  return Response.json(
    {
      success: false,
      message: apiError.message,
      data: null,
      errors: apiError.errors,
    },
    { status: status || apiError.status }
  );
}

export function createSuccessResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200
) {
  return Response.json(
    {
      success: true,
      message,
      data,
      errors: null,
    },
    { status }
  );
}

// Error logging (you can extend this with your logging service)
export function logError(error: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };

  // In production, you might want to send this to a logging service
  console.error("Error logged:", errorInfo);

  return errorInfo;
}

// Error boundary helper for React components
export function createErrorBoundaryError(
  error: Error,
  errorInfo: { componentStack: string }
) {
  return {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  };
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Type guards for error checking
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(
  error: unknown
): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

// HTTP status code constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
