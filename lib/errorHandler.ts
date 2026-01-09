/**
 * Utility functions for handling API errors and displaying professional error messages
 */

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[] | string>;
      error?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Extract a user-friendly error message from an API error response
 */
export function getErrorMessage(error: unknown): string {
  const err = error as ApiError;

  // Check for validation errors object
  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }

  // Check for message in data
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // Check for error in data
  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  // Check for direct message
  if (err.message) {
    return err.message;
  }

  // Check for HTTP status messages
  if (err.response?.status) {
    switch (err.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested item doesn\'t exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `An error occurred (${err.response.status}). Please try again.`;
    }
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract field-specific validation errors from API response
 */
export function getValidationErrors(error: unknown): ValidationErrors | null {
  const err = error as ApiError;

  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    const validationErrors: ValidationErrors = {};

    for (const [field, messages] of Object.entries(errors)) {
      validationErrors[field] = Array.isArray(messages) ? messages[0] : messages;
    }

    return validationErrors;
  }

  return null;
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const err = error as ApiError;
  return err.response?.status === 422 || Boolean(err.response?.data?.errors);
}

/**
 * Get success message with proper formatting
 */
export function formatSuccessMessage(message: string): string {
  return message;
}

/**
 * Extract success message from API response
 */
export function getSuccessMessage(response: unknown): string {
  const res = response as { data?: { message?: string } };
  return res.data?.message || 'Operation completed successfully!';
}
