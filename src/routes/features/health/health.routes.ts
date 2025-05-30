import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// Health check route
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Detailed health check route
router.get('/detailed', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router; 