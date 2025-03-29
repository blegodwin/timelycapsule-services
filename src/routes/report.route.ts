import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  getPendingReports,
  reviewReport,
  deleteReport,
} from '../controllers/report.controller';
import { verifyToken } from '../middleware/verifyToken';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Public routes (require authentication)
router.post('/', verifyToken, createReport);
router.get('/my-reports', verifyToken, getAllReports);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllReports);
router.get('/pending', verifyToken, isAdmin, getPendingReports);
router.get('/:id', verifyToken, isAdmin, getReportById);
router.put('/:id/review', verifyToken, isAdmin, reviewReport);
router.delete('/:id', verifyToken, isAdmin, deleteReport);

export default router;
