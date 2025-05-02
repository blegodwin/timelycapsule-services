import express from 'express';
import healthRouter from './health.routes';
import userRouter from './user.routes';

const router = express.Router();
export default (): express.Router => {
  healthRouter(router);
  userRouter(router);
  return router;
};
