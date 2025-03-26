import express from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import notificationRouter from './notification.router';

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  notificationRouter(router);
  return router;
};
