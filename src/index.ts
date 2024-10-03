import express, { Request, request } from 'express';

import serverConfigVariable from './config/serverConfig';
import dbConnection from './db/dbConnection';
import applyMiddlewares from './middlewares/appMiddleware';
import errorHandler from './middlewares/errorHandler';
import userApiRoutes from './routes/v1/userRoutes/ApiVersionRoutes';

import { IUser } from './models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const app = express();
const port = serverConfigVariable.PORT || 3000;

//----------All middleware of app
applyMiddlewares(app);

//-----db connection
dbConnection();

app.use('/api', userApiRoutes);

//------Global error handler
app.use(errorHandler);

function serverReadyOrStart() {
  app.listen(port, () => {
    console.log(`server is listen at ${port}`);
  });
}

serverReadyOrStart();
