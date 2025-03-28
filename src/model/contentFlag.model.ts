import mongoose, { Types } from 'mongoose';

export interface IContentFlag {
  _id: Types.ObjectId;
  capsuleId: Types.ObjectId;
  reason: string;
  detectedContent: string[];
  status: 'pending' | 'reviewed' | 'cleared';
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  severity: 'low' | 'medium' | 'high';
}

const ContentFlagSchema = new mongoose.Schema<IContentFlag>({
  capsuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Capsule',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  detectedContent: [{
    type: String,
    required: true,
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'cleared'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
});

export const ContentFlag = mongoose.model<IContentFlag>('ContentFlag', ContentFlagSchema);
