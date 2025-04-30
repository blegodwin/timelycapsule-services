import express from 'express';
import { activityLogController } from '../controllers/activityLog.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Routes for explicit logging endpoints
router.post('/login', authMiddleware, activityLogController.logLogin);
router.post(
	'/register',
	authMiddleware,
	activityLogController.logRegistration
);
router.post('/guest-session', activityLogController.logGuestSession);
router.post('/upgrade', authMiddleware, activityLogController.logUpgrade);
router.post(
	'/password-reset',
	authMiddleware,
	activityLogController.logPasswordReset
);

// Routes for retrieving logs (admin or user)
router.get(
	'/user/:userId',
	authMiddleware,
	activityLogController.getUserLogs
);

export default router;
