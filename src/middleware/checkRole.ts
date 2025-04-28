import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';


export function checkRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("user details", req.user)
    const user = req.user;

    if (!user || user.role !== role) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    next();
  };
}


