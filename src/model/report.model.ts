import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  reporter: string;
  reason: string;
  contentId?: string;
  contentType?: string;
  timestamp: Date;
  status: string;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: String, required: true },
    reason: { type: String, required: true },
    contentId: { type: String },
    contentType: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

export const Report = model<IReport>('Report', ReportSchema);
