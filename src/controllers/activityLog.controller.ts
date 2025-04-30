import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ActivityLogger } from '../services/activityLogger.service';
import { ActivityLog } from '../models/activityLog.model';

export const activityLogController = {
	logLogin: async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?._id) {
				res
					.status(400)
					.json({ success: false, message: 'User ID is required' });
				return;
			}

			const userId = `${req.user?._id}`;

			await ActivityLogger.log({
				userId,
				action: 'login',
				metadata: {
					ip: req.ip || req.socket.remoteAddress || '',
					device: req.headers['user-agent'] || '',
					guest: false,
					provider: req.user.provider || 'local',
				},
			});

			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Error logging login:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to log activity' });
		}
	},

	logRegistration: async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?._id) {
				res
					.status(400)
					.json({ success: false, message: 'User ID is required' });
				return;
			}

			const userId = `${req.user?._id}`;

			await ActivityLogger.log({
				userId,
				action: 'register',
				metadata: {
					ip: req.ip || req.socket.remoteAddress || '',
					device: req.headers['user-agent'] || '',
					guest: false,
					provider: req.user.provider || 'local',
					isVerified: req.user.isVerified,
				},
			});

			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Error logging registration:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to log activity' });
		}
	},

	logGuestSession: async (req: Request, res: Response): Promise<void> => {
		try {
			// No userId for guests
			await ActivityLogger.log({
				action: 'guest_session_start',
				metadata: {
					ip: req.ip || req.socket.remoteAddress || '',
					device: req.headers['user-agent'] || '',
					guest: true,
				},
			});

			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Error logging guest session:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to log activity' });
		}
	},

	logUpgrade: async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?._id) {
				res
					.status(400)
					.json({ success: false, message: 'User ID is required' });
				return;
			}

			const userId = `${req.user?._id}`;

			await ActivityLogger.log({
				userId,
				action: 'upgrade',
				metadata: {
					ip: req.ip || req.socket.remoteAddress || '',
					device: req.headers['user-agent'] || '',
					guest: false,
					roles: req.user.roles,
				},
			});

			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Error logging upgrade:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to log activity' });
		}
	},

	logPasswordReset: async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?._id) {
				res
					.status(400)
					.json({ success: false, message: 'User ID is required' });
				return;
			}

			const userId = `${req.user?._id}`;

			await ActivityLogger.log({
				userId,
				action: 'password_reset',
				metadata: {
					ip: req.ip || req.socket.remoteAddress || '',
					device: req.headers['user-agent'] || '',
					guest: false,
				},
			});

			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Error logging password reset:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to log activity' });
		}
	},

	getUserLogs: async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = `${req.user?._id}`;

			if (!mongoose.Types.ObjectId.isValid(userId)) {
				res
					.status(400)
					.json({ success: false, message: 'Invalid user ID format' });
				return;
			}

			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const skip = (page - 1) * limit;

			const logs = await ActivityLog.find({ userId })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);

			const total = await ActivityLog.countDocuments({ userId });

			res.status(200).json({
				success: true,
				data: logs,
				pagination: {
					total,
					page,
					pages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error retrieving logs:', error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to retrieve logs' });
		}
	},
};
