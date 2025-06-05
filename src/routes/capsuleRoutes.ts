import express, { Router, Request, Response } from 'express';
import {
  createCapsule,
  deleteCapsule,
  getCapsuleById,
  getCapsules,
  getMyCapsules,
} from '../controllers/capsuleController';
import { AuthMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.post(
  '/capsules',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    createCapsule(req, res);
  }
);
router.get(
  '/capsules',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    getCapsules(req, res);
  }
);

router.get(
  '/capsules/my',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    getMyCapsules(req, res);
  }
);

router.get(
  '/capsules/:id',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    getCapsuleById(req, res);
  }
);

router.delete(
  '/capsules/:id',
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    deleteCapsule(req, res);
  }
);

export default router;
