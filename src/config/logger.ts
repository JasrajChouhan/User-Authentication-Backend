import { createLogger, format, transports } from 'winston';

import serverConfigVariable from './serverConfig';

const { combine, timestamp, json, colorize, label, prettyPrint } = format;

//------Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp, label }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  })
);

//------Custom format for file logging
const fileLogFormat = format.combine(format.timestamp(), format.json());

//------Create a Winston logger
const logger = createLogger({
  level: serverConfigVariable.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(label({ label: 'app' }), timestamp(), prettyPrint()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
      handleExceptions: true,
    }),
    new transports.File({
      filename: 'app.log',
      format: fileLogFormat,
      handleExceptions: true,
    }),
    new transports.File({
      filename: 'app-error.log',
      level: 'error',
      format: fileLogFormat,
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
  silent: serverConfigVariable.NODE_ENV === 'test',
});

export default logger;
