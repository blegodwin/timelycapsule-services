import express from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import analyticRouter from './analytic.router';
import legendaryCapsules from './legendaryCapsules.routes';
import paymentRouter from './payment.router';
import subscriptionRouter from './subscription.router';
import aiContentRouter from './ai-content.router';
import streakRouter from './streak.router';
import referralRouter from './referral-router';
import publicRouter from './public-capsule.router';
import capsuleRouter from './capsule.routes';

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  //analyticRouter(router);
  legendaryCapsules(router);
  paymentRouter(router);
  subscriptionRouter(router);
  aiContentRouter(router);
  referralRouter(router);
  streakRouter(router);
  publicRouter(router);
  capsuleRouter(router);

  return router;
};
