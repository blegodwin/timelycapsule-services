import mongoose from 'mongoose';

export interface IActivity extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  type: string;
  content: string;
  createdAt: Date;
}

const ActivitySchema = new mongoose.Schema<IActivity>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
