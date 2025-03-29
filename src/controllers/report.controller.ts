import { Request, Response } from 'express';
import * as ReportService from '../services/report.service';
import { isValidObjectId } from 'mongoose';

// Create a new report
export const createReport = async (req: Request, res: Response) => {
  try {
    const { capsuleId, reason } = req.body;
    const reportedBy = req.user?._id; // Assuming user is attached to req by auth middleware

    // Validate input
    if (!capsuleId || !reason || !reportedBy) {
      return res.status(400).json({
        success: false,
        message: 'CapsuleId, reason, and user authentication are required'
      });
    }

    if (!isValidObjectId(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capsule ID format'
      });
    }

    const report = await ReportService.createReport({
      capsuleId,
      reason,
      reportedBy: reportedBy.toString()
    });

    return res.status(201).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reports with optional filters
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { status, priority, capsuleId, reportedBy, category } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (capsuleId) filter.capsuleId = capsuleId;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (category) filter.category = category;

    // Validate priority if provided
    if (priority && !['urgent', 'high', 'normal', 'low'].includes(priority as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const reports = await ReportService.getAllReports(filter);
    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get pending reports (admin only)
export const getPendingReports = async (req: Request, res: Response) => {
  try {
    const { priority } = req.query;
    
    // If priority is specified, validate it
    if (priority && !['urgent', 'high'].includes(priority as string)) {
      return res.status(400).json({
        success: false,
        message: 'Priority filter can only be "urgent" or "high" for pending reports'
      });
    }

    const reports = await ReportService.getPendingReports(priority as 'urgent' | 'high' | undefined);
    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific report by ID
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await ReportService.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Review a report (admin only)
export const reviewReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewedBy = req.user?._id; // Assuming user is attached by auth middleware

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    if (!status || !reviewedBy) {
      return res.status(400).json({
        success: false,
        message: 'Status and admin authentication are required'
      });
    }

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "reviewed" or "dismissed"'
      });
    }

    const report = await ReportService.reviewReport(id, {
      status,
      reviewedBy: reviewedBy.toString(),
      reviewNotes
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a report (admin only)
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await ReportService.deleteReport(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
