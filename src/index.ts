import { app } from './app';
import dotenv from 'dotenv';
import { connectToDB } from './config/db';
import { DB_CONNECTION_STRING } from './constants';
import logger from './utils/logger.utils';
import { Request, Response, NextFunction } from 'express';
import { notFoundMiddleware } from './middleware/notFoundMiddleware';
import appRoute from './routes';

dotenv.config();

app.use('/api/', appRoute());

app.use(notFoundMiddleware);

app.listen(process.env.PORT, async () => {
  await connectToDB(DB_CONNECTION_STRING);
  console.log(`Server is running on port ${process.env.PORT}`);
});
