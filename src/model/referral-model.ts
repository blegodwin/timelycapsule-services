import mongoose from 'mongoose';

export interface IReferral extends mongoose.Document {
  referrerId: string;
  inviteeEmail: string;
  referralCode: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new mongoose.Schema({
  referrerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  inviteeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);