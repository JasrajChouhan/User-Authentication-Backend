import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import rateLimiterMiddleware from './rateLimitterMiddleware';
import errorHandler from './errorHandler';

function applyMiddlewares(app: any) {
  // ------Body parsers
  app.use(
    express.urlencoded({
      extended: true,
      limit: '16kb',
    })
  );
  app.use(
    express.json({
      limit: `16kb`,
    })
  );

  // -------Security and performance middlewares
  app.use(cors());
  app.use(helmet());
  app.use(compression());

  // -------Logging
  app.use(morgan('dev'));

  // -------Cookies management
  app.use(cookieParser());

  app.use(rateLimiterMiddleware);

  //----- unhandle promise rejection error
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
  });

  //------ unhandle uncaught exception error
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error.message);
    process.exit(1);
  });
}

export default applyMiddlewares;
