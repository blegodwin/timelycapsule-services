import { Request, Response } from 'express';
import * as ReportService from '../services/report.service';

export const createReport = async (req: Request, res: Response) => {
  try {
    const { reporter, reason, contentId, contentType } = req.body;
    if (!reporter || !reason) return res.status(400).json({ success: false, message: 'Reporter and reason are required' });
    const report = await ReportService.createReport({ reporter, reason, contentId, contentType });
    return res.status(201).json({ success: true, data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await ReportService.getAllReports();
    return res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await ReportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    return res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const report = await ReportService.updateReport(req.params.id, req.body);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    return res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const report = await ReportService.deleteReport(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    return res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
