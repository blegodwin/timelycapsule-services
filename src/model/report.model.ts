import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  capsuleId: Types.ObjectId;
  reason: string;
  reportedBy: Types.ObjectId;
  status: 'pending' | 'reviewed' | 'dismissed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: string[];
  autoAnalysis: {
    toxicityScore?: number;
    categories?: string[];
    recommendedAction?: string;
    confidence: number;
  };
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    capsuleId: { type: Schema.Types.ObjectId, ref: 'Capsule', required: true },
    reason: { type: String, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending' 
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'normal', 'low'],
      default: 'normal'
    },
    category: {
      type: [String],
      enum: [
        'harassment',
        'hate_speech',
        'inappropriate_content',
        'spam',
        'violence',
        'copyright',
        'other'
      ],
      default: ['other']
    },
    autoAnalysis: {
      toxicityScore: Number,
      categories: [String],
      recommendedAction: String,
      confidence: { type: Number, default: 0 }
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

// Index for faster queries
ReportSchema.index({ status: 1 });
ReportSchema.index({ capsuleId: 1 });
ReportSchema.index({ reportedBy: 1 });
ReportSchema.index({ priority: 1 });
ReportSchema.index({ category: 1 });
ReportSchema.index({ 'autoAnalysis.toxicityScore': 1 });

export const Report = model<IReport>('Report', ReportSchema);
