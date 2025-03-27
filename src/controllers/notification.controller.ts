import { Request, Response } from "express";
import mongoose from "mongoose";
import * as notificationService from "../services/notification.service";
import notificationValidationSchema from "../utils/joivalidators/notification/createNotification";

const NotificationController = {
  createNotification: async (req: Request, res: Response) => {
    try {
      const { error } = notificationValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const notification = await notificationService.createNotification(req.body);
      return res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  getAllNotifications: async (req: Request, res: Response) => {
    try {
      const notifications = await notificationService.getAllNotifications();
      return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  getNotificationById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const notification = await notificationService.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification retrieved successfully",
        data: notification,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  updateNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const { error } = notificationValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const updatedNotification = await notificationService.updateNotification(id, req.body);
      if (!updatedNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification updated successfully",
        data: updatedNotification,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const deletedNotification = await notificationService.deleteNotification(id);
      if (!deletedNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  },

  updateNotificationReadStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; 
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const notification = await notificationService.markNotificationAsRead(id);

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "An error occurred while updating notification",
      });
    }
  },

};

export { NotificationController };
