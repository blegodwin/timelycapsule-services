// src/controllers/notification.controller.ts
import { Request, Response } from "express";
import Notification from "../model/notification.model";

// Create a new notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, user, type } = req.body;

    // Create a new notification instance
    const newNotification = new Notification({
      title,
      message,
      user,
      type,
    });

    await newNotification.save();
    return res.status(201).json(newNotification);
  } catch (error) {
    return res.status(500).json({
      message: "Error creating notification",
      error: (error as Error).message,
    });
  }
};

// Get notifications for a specific user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Retrieve notifications for the given user
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching notifications",
      error: (error as Error).message,
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    // Find the notification by ID
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update the 'read' status
    notification.read = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({
      message: "Error marking notification as read",
      error: (error as Error).message,
    });
  }
};
