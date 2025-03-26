import { Request, Response } from "express";
import {
  PaymentService,
  CreatePaymentData,
  UpdatePaymentData,
} from "../services/payment.service";
import { UserRequest } from "./user.controller";

export const PaymentController = {
  createPayment: async (req: UserRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const paymentData: CreatePaymentData = {
        userId,
        amount: req.body.amount,
        currency: req.body.currency,
        paymentMethod: req.body.paymentMethod,
        transactionId: req.body.transactionId,
        description: req.body.description,
        metadata: req.body.metadata,
      };

      const payment = await PaymentService.createPayment(paymentData);

      res.status(201).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to create payment",
      });
    }
  },

  getAllPayments: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { payments, total, totalPages } =
        await PaymentService.getAllPayments(page, limit);

      return res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: {
          payments,
          pagination: {
            currentPage: page,
            totalPages,
            totalPayments: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to retrieve payments",
      });
    }
  },

  getUserPayments: async (req: UserRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { payments, total, totalPages } =
        await PaymentService.getPaymentsByUserId(userId, page, limit);

      return res.status(200).json({
        success: true,
        message: "User payments retrieved successfully",
        data: {
          payments,
          pagination: {
            currentPage: page,
            totalPages,
            totalPayments: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to retrieve user payments",
      });
    }
  },

  getPaymentById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      const payment = await PaymentService.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to retrieve payment",
      });
    }
  },

  updatePayment: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      const updateData: UpdatePaymentData = {
        amount: req.body.amount,
        currency: req.body.currency,
        status: req.body.status,
        paymentMethod: req.body.paymentMethod,
        transactionId: req.body.transactionId,
        description: req.body.description,
        metadata: req.body.metadata,
      };

      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof UpdatePaymentData] === undefined &&
          delete updateData[key as keyof UpdatePaymentData]
      );

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      const payment = await PaymentService.updatePayment(id, updateData);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to update payment",
      });
    }
  },

  deletePayment: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      const isDeleted = await PaymentService.deletePayment(id);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to delete payment",
      });
    }
  },

  updatePaymentStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      if (
        !status ||
        !["pending", "completed", "failed", "refunded"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid status is required (pending, completed, failed, or refunded)",
        });
      }

      const payment = await PaymentService.updatePaymentStatus(
        id,
        status as "pending" | "completed" | "failed" | "refunded"
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: (error as Error).message || "Failed to update payment status",
      });
    }
  },
};
