import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/user.model';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Get token from the Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, message: 'No token provided' });
			return;
		}

		const token = authHeader.split(' ')[1];

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

		// Find user by ID
		const user = await User.findById(decoded.id);

		if (!user) {
			res.status(401).json({ success: false, message: 'User not found' });
			return;
		}

		// Attach user to request object
		req.user = user;

		// Update last login time
		user.lastLoginAt = new Date();
		await user.save();

		next();
	} catch (error) {
		console.error('Auth middleware error:', error);
		res.status(401).json({ success: false, message: 'Invalid token' });
	}
};

// Authorization
export const hasRole = (role: string) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res
				.status(401)
				.json({ success: false, message: 'User not authenticated' });
			return;
		}

		if (!req.user.roles.includes(role)) {
			res.status(403).json({ success: false, message: 'Access denied' });
			return;
		}

		next();
	};
};
