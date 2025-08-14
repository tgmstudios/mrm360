import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function createError(message: string, statusCode: number = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function handleApiError(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.error('API Error:', {
    error,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    if (apiError.statusCode) {
      return res.status(apiError.statusCode).json({
        success: false,
        error: apiError.message,
        code: apiError.code
      });
    }
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, req, res);
    }
  };
}

// Common error types
export const Errors = {
  NOT_FOUND: (resource: string) => createError(`${resource} not found`, 404, 'NOT_FOUND'),
  UNAUTHORIZED: () => createError('Unauthorized', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () => createError('Forbidden', 403, 'FORBIDDEN'),
  BAD_REQUEST: (message: string) => createError(message, 400, 'BAD_REQUEST'),
  VALIDATION_ERROR: (message: string) => createError(message, 400, 'VALIDATION_ERROR'),
  CONFLICT: (message: string) => createError(message, 409, 'CONFLICT'),
  INTERNAL_ERROR: () => createError('Internal server error', 500, 'INTERNAL_ERROR')
};
