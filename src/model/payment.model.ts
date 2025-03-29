// src/models/Payment.ts
import mongoose, { Document, Schema } from "mongoose";
import User from "./user.model";
import { Capsule } from "./capsule.model";

export enum PaymentCurrency {
  ETH = "ETH",
  USDC = "USDC",
  XLM = "XLM",
}

export enum PaymentStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId | typeof User;
  capsule?: mongoose.Types.ObjectId | typeof Capsule;
  amount: number;
  currency: PaymentCurrency;
  transactionHash: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    capsule: {
      type: Schema.Types.ObjectId,
      ref: "Capsule",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(PaymentCurrency),
      required: true,
    },
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionHash: 1 }, { unique: true, sparse: true });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;