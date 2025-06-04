import express, { Router } from 'express';
import healthRoutes from './features/health';
import authRoutes from './features/auth.routes';

const router: Router = express.Router();

// Mount feature routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router; 
