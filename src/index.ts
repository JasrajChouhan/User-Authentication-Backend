import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';

import serverConfigVariable from './config/serverConfig';
import dbConnection from './db/dbConnection';
import applyMiddlewares from './middlewares/appMiddleware';
import errorHandler from './middlewares/errorHandler';
import apiRoute from './routes/v1/ApiVersionRoutes';

import { IUser } from './models/user.model';

import swaggerDocument from './swagger/swagger.json';
import { createServer } from 'http';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const app = express();
const server = createServer(app);
const port = serverConfigVariable.PORT || 4000;

// ----- socket.io server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  },
});

const editorNamespace = io.of('/editor');

io.on('connection', socket => {
  console.log(`${socket.id} editor is connected.`);
});

//----------Swagger-Ui section
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//----------All middleware of app
applyMiddlewares(app);

//-----db connection
dbConnection();

app.use('/api', apiRoute);

//-----Not found page route
app.use('*', (req: Request, res: Response) => {
  res.send('<h1>Page 404, Not found</h1>');
});

//------Global error handler
app.use(errorHandler);

function serverReadyOrStart() {
  server.listen(port, () => {
    console.log(`server is listen at ${port}`);
  });
}

serverReadyOrStart();
