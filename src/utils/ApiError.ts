import serverConfigVariable from '../config/serverConfig';

class ApiError extends Error {
  statusCode: number;
  errors?: string[] | undefined;
  message: string;
  stack?: string | undefined;
  data?: null;

  constructor(statusCode: number, message = 'Something went wrong', stack: string = '', errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.stack = stack;
    this.errors = errors;
    this.data = null;

    //-----check node-env
    const isProduction = serverConfigVariable.NODE_ENV === 'production';

    if (stack) {
      this.stack = isProduction ? '' : stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
