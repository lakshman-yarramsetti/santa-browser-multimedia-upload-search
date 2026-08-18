import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} was not found.`,
      404
    )
  );
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message =
    error.message || 'An unexpected server error occurred.';
  let details = error.details;

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the maximum allowed size.'
        : 'Invalid file upload.';
  }

  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists.';
  }

  if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed.';
    details = error.issues;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res
    .status(statusCode)
    .json({ message, ...(details ? { details } : {}) });
}