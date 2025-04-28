import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.model';

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


