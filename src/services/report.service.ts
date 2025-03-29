import { Report, IReport } from '../model/report.model';
import { Types } from 'mongoose';
import Notification from '../model/notification.model';
import User from '../model/user.model';
import { analyzeCapsuleContent } from './content-analysis.service';

// Helper function to determine priority based on analysis
function determinePriority(
  toxicityScore: number,
  categories: string[]
): 'urgent' | 'high' | 'normal' | 'low' {
  if (toxicityScore >= 0.8) return 'urgent';
  if (toxicityScore >= 0.5) return 'high';
  if (categories.includes('violence') || categories.includes('hate_speech')) return 'high';
  if (toxicityScore >= 0.3) return 'normal';
  return 'low';
}

// Helper function to notify admins
async function notifyAdmins(message: string, priority: 'urgent' | 'high' | 'normal' | 'low') {
  try {
    // Find all admin users
    const admins = await User.find({ isAdmin: true });
    
    // Create notifications for each admin
    const notifications = admins.map((admin: { _id: Types.ObjectId }) => ({
      recipient: admin._id,
      message: `[${priority.toUpperCase()}] ${message}`,
      isRead: false
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
}

export const createReport = async (data: {
  capsuleId: string;
  reason: string;
  reportedBy: string;
}): Promise<IReport> => {
  // Analyze content
  const analysis = await analyzeCapsuleContent(new Types.ObjectId(data.capsuleId));
  
  // Determine priority
  const priority = determinePriority(analysis.toxicityScore, analysis.categories);

  const newReport = new Report({
    capsuleId: new Types.ObjectId(data.capsuleId),
    reason: data.reason,
    reportedBy: new Types.ObjectId(data.reportedBy),
    status: 'pending',
    priority,
    category: analysis.categories.length > 0 ? analysis.categories : ['other'],
    autoAnalysis: {
      toxicityScore: analysis.toxicityScore,
      categories: analysis.categories,
      recommendedAction: analysis.recommendedAction,
      confidence: analysis.confidence
    }
  });
  
  const savedReport = await newReport.save();
  
  // Notify admins with priority
  await notifyAdmins(
    `New ${priority} content report received for capsule ${data.capsuleId}. Auto-analysis confidence: ${Math.round(analysis.confidence * 100)}%`,
    priority
  );
  
  return savedReport;
};

export const getAllReports = async (
  filter: {
    status?: 'pending' | 'reviewed' | 'dismissed';
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    capsuleId?: string;
    reportedBy?: string;
    category?: string;
  } = {}
): Promise<IReport[]> => {
  const query: any = {};
  
  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.priority) {
    query.priority = filter.priority;
  }
  if (filter.capsuleId) {
    query.capsuleId = new Types.ObjectId(filter.capsuleId);
  }
  if (filter.reportedBy) {
    query.reportedBy = new Types.ObjectId(filter.reportedBy);
  }
  if (filter.category) {
    query.category = filter.category;
  }

  return await Report.find(query)
    .populate('capsuleId', 'title message')
    .populate('reportedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ priority: 1, createdAt: -1 }); // Sort by priority first, then by date
};

export const getPendingReports = async (priorityLevel?: 'urgent' | 'high'): Promise<IReport[]> => {
  const filter: any = { status: 'pending' };
  if (priorityLevel) {
    filter.priority = priorityLevel;
  }
  return await getAllReports(filter);
};

export const getReportById = async (id: string): Promise<IReport | null> => {
  return await Report.findById(id)
    .populate('capsuleId', 'title message')
    .populate('reportedBy', 'name email')
    .populate('reviewedBy', 'name email');
};

export const reviewReport = async (
  id: string,
  data: {
    status: 'reviewed' | 'dismissed';
    reviewedBy: string;
    reviewNotes?: string;
  }
): Promise<IReport | null> => {
  const report = await Report.findByIdAndUpdate(
    id,
    {
      status: data.status,
      reviewedBy: new Types.ObjectId(data.reviewedBy),
      reviewedAt: new Date(),
      reviewNotes: data.reviewNotes
    },
    { new: true }
  ).populate('capsuleId reportedBy reviewedBy');

  if (report) {
    // Notify the reporter about the review
    await Notification.create({
      recipient: report.reportedBy,
      message: `Your report for capsule ${report.capsuleId} has been ${data.status}`,
      isRead: false
    });

    // If the report was urgent/high priority, notify admins about the resolution
    if (['urgent', 'high'].includes(report.priority)) {
      await notifyAdmins(
        `High-priority report ${report._id} has been ${data.status}`,
        report.priority
      );
    }
  }

  return report;
};

export const deleteReport = async (id: string): Promise<IReport | null> => {
  return await Report.findByIdAndDelete(id);
};
