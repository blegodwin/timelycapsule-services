//src/models/UnlockAttempt.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUnlockAttempt extends Document {
  capsule: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  attemptType: 'password' | 'location';
  successful: boolean;
  details?: string;
  createdAt: Date;
}

const unlockAttemptSchema = new Schema<IUnlockAttempt>(
  {
    capsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    attemptType: {
      type: String,
      enum: ['password', 'location'],
      required: true,
    },
    successful: {
      type: Boolean,
      required: true,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

unlockAttemptSchema.index({ capsule: 1, user: 1 });
unlockAttemptSchema.index({ ipAddress: 1 });
unlockAttemptSchema.index({ createdAt: -1 });

export const UnlockAttempt = mongoose.model<IUnlockAttempt>(
  'UnlockAttempt',
  unlockAttemptSchema
);
