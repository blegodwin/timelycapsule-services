import Payment, { IPayment } from "../model/payment.model";
import { Types } from "mongoose";

export interface CreatePaymentData {
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  transactionId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentData {
  amount?: number;
  currency?: string;
  status?: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class PaymentService {
  static async createPayment(
    paymentData: CreatePaymentData
  ): Promise<IPayment> {
    try {
      const payment = new Payment({
        userId: new Types.ObjectId(paymentData.userId),
        amount: paymentData.amount,
        currency: paymentData.currency || "USD",
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        description: paymentData.description || "",
        metadata: paymentData.metadata || {},
      });

      await payment.save();
      return payment;
    } catch (error) {
      throw new Error(`Failed to create payment: ${(error as Error).message}`);
    }
  }

  static async getAllPayments(
    page = 1,
    limit = 10
  ): Promise<{ payments: IPayment[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Payment.countDocuments(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { payments, total, totalPages };
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${(error as Error).message}`);
    }
  }

  static async getPaymentsByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ payments: IPayment[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find({ userId: new Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Payment.countDocuments({ userId: new Types.ObjectId(userId) }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { payments, total, totalPages };
    } catch (error) {
      throw new Error(
        `Failed to fetch user payments: ${(error as Error).message}`
      );
    }
  }

  static async getPaymentById(paymentId: string): Promise<IPayment | null> {
    try {
      const payment = await Payment.findById(paymentId);
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${(error as Error).message}`);
    }
  }

  static async updatePayment(
    paymentId: string,
    updateData: UpdatePaymentData
  ): Promise<IPayment | null> {
    try {
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { ...updateData },
        { new: true, runValidators: true }
      );

      return payment;
    } catch (error) {
      throw new Error(`Failed to update payment: ${(error as Error).message}`);
    }
  }

  static async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const result = await Payment.findByIdAndDelete(paymentId);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete payment: ${(error as Error).message}`);
    }
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: "pending" | "completed" | "failed" | "refunded"
  ): Promise<IPayment | null> {
    try {
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { status },
        { new: true }
      );

      return payment;
    } catch (error) {
      throw new Error(
        `Failed to update payment status: ${(error as Error).message}`
      );
    }
  }
}
