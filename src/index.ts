import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import serverConfigVariable from './config/serverConfig';
import dbConnection from './db/dbConnection';
import applyMiddlewares from './middlewares/appMiddleware';
import errorHandler from './middlewares/errorHandler';
import userApiRoutes from './routes/v1/userRoutes/ApiVersionRoutes';

import { IUser } from './models/user.model';

import swaggerDocument from './swagger/swagger.json';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const app = express();
const port = serverConfigVariable.PORT || 4000;

//----------Swagger-Ui section
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//----------All middleware of app
applyMiddlewares(app);

//-----db connection
dbConnection();

app.use('/api', userApiRoutes);

//-----Not found page route
app.use('*', (req: Request, res: Response) => {
  res.send('<h1>Page 404, Not found');
});

//------Global error handler
app.use(errorHandler);

function serverReadyOrStart() {
  app.listen(port, () => {
    console.log(`server is listen at ${port}`);
  });
}

serverReadyOrStart();
