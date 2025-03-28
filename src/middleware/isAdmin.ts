import { Request, Response, NextFunction } from 'express';
import { handleResponse } from '../utils/responseHandler';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: string;
      };
    }
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      handleResponse(res, 403, 'Access denied: Admin privileges required');
      return;
    }
    next();
  } catch (error) {
    handleResponse(res, 500, 'Error checking admin status');
  }
};
