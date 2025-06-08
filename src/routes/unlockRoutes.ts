//src/routes/unlockRoutes.ts
import express from 'express';
import { unlockLimiter, unlockCapsule } from '../controllers/unlockController';

const router = express.Router();

router.post('/capsules/:id/unlock', unlockLimiter, unlockCapsule);

export default router;
