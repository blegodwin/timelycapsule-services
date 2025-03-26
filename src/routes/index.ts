import express from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import streakRouter from './streak.router';
import referralRouter from './referral-router';

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  streakRouter(router);
  referralRouter(router);
  return router;
};
