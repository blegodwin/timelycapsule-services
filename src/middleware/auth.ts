import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

export class AuthMiddleware {
  static async requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        res.status(401).json({ 
          error: 'Access denied', 
          message: 'No token provided' 
        });
        return;
      }

      const decoded = JWTUtils.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        res.status(401).json({ 
          error: 'Access denied', 
          message: 'Invalid token - user not found' 
        });
        return;
      }

      req.user = user;
      req.userId = user._id.toString();
      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        res.status(401).json({ 
          error: 'Token expired', 
          message: 'Please refresh your token' 
        });
        return;
      }
      
      res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
  }

  
  static async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        next();
        return;
      }

      const decoded = JWTUtils.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }

      next();
    } catch (error) {
      // For optional auth, we don't return an error, just continue without user
      next();
    }
  }

  
  static async requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      
      await AuthMiddleware.requireAuth(req, res, () => {});
      
      if (!req.user) {
        res.status(401).json({ 
          error: 'Access denied', 
          message: 'Authentication required' 
        });
        return;
      }


      if (!req.user.isVerified) {
        res.status(403).json({ 
          error: 'Access denied', 
          message: 'Admin privileges required' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        error: 'Server error', 
        message: 'Error checking admin status' 
      });
    }
  }

  
  static async requireVerified(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthMiddleware.requireAuth(req, res, () => {});
      
      if (!req.user?.isVerified) {
        res.status(403).json({ 
          error: 'Account verification required', 
          message: 'Please verify your account to access this resource' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        error: 'Server error', 
        message: 'Error checking verification status' 
      });
    }
  }

  private static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    
    const tokenFromCookie = req.cookies?.accessToken;
    if (tokenFromCookie) {
      return tokenFromCookie;
    }
    
    return null;
  }
}
