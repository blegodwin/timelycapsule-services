import express, { Router } from 'express';
import healthRoutes from './features/health';

const router: Router = express.Router();

// Mount feature routes
router.use('/health', healthRoutes);

export default router; 