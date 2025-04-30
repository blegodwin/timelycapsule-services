import { Request, Response, NextFunction } from 'express';
import { ActivityLogger } from '../services/activityLogger.service';
import { IUser } from '../models/user.model';

// Extend Express Request to include user property
declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}

export const logActivity = (action: string) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		// Extract basic request metadata
		const metadata = {
			ip: req.ip || req.socket.remoteAddress || '',
			device: req.headers['user-agent'] || '',
			guest: !req.user,
		};

		// Get user ID if available
		const userId = `${req.user?._id}`;

		// Log the activity asynchronously (non-blocking)
		if (req.user) {
			ActivityLogger.log({
				userId,
				action,
				metadata,
			});
		} else {
			ActivityLogger.log({
				action,
				metadata,
			});
		}

		next();
	};
};
