import { Report, IReport } from '../models/report.model';

export const createReport = async (data: Partial<IReport>): Promise<IReport> => {
  const newReport = new Report(data);
  return await newReport.save();
};

export const getAllReports = async (): Promise<IReport[]> => {
  return await Report.find();
};

export const getReportById = async (id: string): Promise<IReport | null> => {
  return await Report.findById(id);
};

export const updateReport = async (id: string, data: Partial<IReport>): Promise<IReport | null> => {
  return await Report.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReport = async (id: string): Promise<IReport | null> => {
  return await Report.findByIdAndDelete(id);
};
