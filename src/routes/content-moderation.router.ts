import express from 'express';
import { getFlaggedContent, reviewFlaggedContent } from '../controllers/content-moderation.controller';
import { verifyToken } from '../middleware/verifyToken';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Admin routes for content moderation
router.get('/flagged', verifyToken, isAdmin, getFlaggedContent);
router.post('/flagged/:flagId/review', verifyToken, isAdmin, reviewFlaggedContent);

export default router;
