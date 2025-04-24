import express from 'express';
import healthRouter from './health.routes';

const router = express.Router();
export default (): express.Router => {
  healthRouter(router);
  return router;
};
