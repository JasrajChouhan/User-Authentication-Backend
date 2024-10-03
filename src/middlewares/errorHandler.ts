import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError';

// ------Error-handling middleware
function errorHandler(err: ApiError | Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // -----------Handling JWT Errors
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token. Unauthorized access.';
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
  }

  // -----------Handling MongoDB Errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed. Check the input data.';
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (isMongoError(err) && err.code === 11000) {
    // Duplicate key error (like for unique fields)
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different ${field}.`;
  }

  // -----Send the error response once
  res.status(statusCode).json({
    success: false,
    message,
    errorName: err.name || 'Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // Stack trace only in development
  });
}

// -----Helper function to identify MongoDB errors
function isMongoError(error: any): error is mongoose.Error & { code: number; keyValue: any } {
  return (error as any).code !== undefined;
}

export default errorHandler;
