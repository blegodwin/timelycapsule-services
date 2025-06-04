import express, { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.post('/register', (req: Request, res: Response) => {
  AuthController.register(req, res);
});

router.post('/login', (req: Request, res: Response) => {
  AuthController.login(req, res);
});

router.post('/refresh', (req: Request, res: Response) => {
  AuthController.refreshToken(req, res);
});

// Protected routes
router.post('/logout', AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.logout(req, res);
});

router.post('/logout-all', AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.logoutAll(req, res);
});

router.get('/me', AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.getCurrentUser(req, res);
});

router.put('/profile', AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.updateProfile(req, res);
});

router.get('/sessions', AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.getUserSessions(req, res);
});

export default router;
