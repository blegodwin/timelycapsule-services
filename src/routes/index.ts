import express from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import streakRouter from './streak.router';
import publicRouter from './public-capsule.router';

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  streakRouter(router)
  publicRouter(router);
  return router;
};
