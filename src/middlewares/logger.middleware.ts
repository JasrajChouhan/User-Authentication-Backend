import morgan from 'morgan';

import logger from '../config/logger';

interface MorganLog {
  method: string;
  url: string;
  status: string;
  responseTime: string;
}

const morganFormat = ':method :url :status :response-time ms';

export function morganMiddleware() {
  return morgan(morganFormat, {
    stream: {
      write: message => {
        const logObject = parseMorganMessage(message);
        logger.info(JSON.stringify(logObject));
      },
    },
  });
}

export function parseMorganMessage(message: string): MorganLog {
  const parts = message.split(' ');
  return {
    method: parts[0],
    url: parts[1],
    status: parts[2],
    responseTime: parts[3],
  };
}
