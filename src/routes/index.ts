import subscriptionRouter from './subscription.router';
import express from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import aiContentRouter from './ai-content.router';
import streakRouter from './streak.router';
import referralRouter from './referral-router';
import publicRouter from './public-capsule.router';
import capsuleRouter from './capsule.routes';

const router = express.Router();
export default (): express.Router => {
  subscriptionRouter(router);
  authRouter(router);
  userRouter(router);
  aiContentRouter(router);
  referralRouter(router);
  streakRouter(router);
  publicRouter(router);
  capsuleRouter(router);
  return router;
};
