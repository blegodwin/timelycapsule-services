import mongoose, { Document, Schema } from 'mongoose';

export interface IFund extends Document {
  _id: mongoose.Types.ObjectId;
  capsule: mongoose.Types.ObjectId;
  attachedBy: mongoose.Types.ObjectId;

  cryptocurrency: string; // BTC, ETH, etc.
  amount: number;
  walletAddress: string;
  privateKey?: string; // encrypted

  depositTransactionHash?: string;
  withdrawTransactionHash?: string;

  status: 'pending' | 'confirmed' | 'withdrawn' | 'failed';
  confirmations: number;

  withdrawnBy?: mongoose.Types.ObjectId;
  withdrawnAt?: Date;
  withdrawalAddress?: string;

  exchangeRate?: number; 
  feesPaid: number;

  createdAt: Date;
  updatedAt: Date;
}

const fundSchema = new Schema<IFund>(
  {
    capsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
      unique: true,
    },
    attachedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cryptocurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      select: false, 
    },
    depositTransactionHash: String,
    withdrawTransactionHash: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'withdrawn', 'failed'],
      default: 'pending',
    },
    confirmations: {
      type: Number,
      default: 0,
    },
    withdrawnBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    withdrawnAt: Date,
    withdrawalAddress: String,
    exchangeRate: Number,
    feesPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fundSchema.index({ capsule: 1 });
fundSchema.index({ attachedBy: 1 });
fundSchema.index({ status: 1 });
fundSchema.index({ cryptocurrency: 1 });

export const Fund = mongoose.model<IFund>('Fund', fundSchema);