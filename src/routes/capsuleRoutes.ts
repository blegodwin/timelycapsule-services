
import express, { Router, Request, Response } from 'express';
import { CapsuleController } from '../controllers/capsuleController';
import { AuthMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.post(
  '/capsules',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    CapsuleController.createCapsule(req, res);
  }
);

export default router;