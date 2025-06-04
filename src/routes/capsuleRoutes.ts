
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
router.get(
  '/capsules',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    CapsuleController.getCapsules(req, res);
  }
);

router.get(
  '/capsules/my',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    CapsuleController.getMyCapsules(req, res);
  }
);

router.get(
  '/capsules/:id',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    CapsuleController.getCapsuleById(req, res);
  }
);


export default router;