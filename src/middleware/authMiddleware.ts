import { Request, Response, NextFunction } from 'express';
import { User, IUser, UserRole } from '../models/user.model';
import jwt from 'jsonwebtoken';



declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        displayName: string;
        email: string;
        role: UserRole;
        guest: boolean;
        isVerified: boolean;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string, displayName: string, email: string, role: UserRole, guest: boolean, isVerified: boolean };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}





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

