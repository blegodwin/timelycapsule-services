import { Request, Response, NextFunction } from "express";

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Your existing implementation
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Simulate fetching notifications for the user
    const notifications = [
      { id: 1, userId, message: "Notification 1", read: false },
      { id: 2, userId, message: "Notification 2", read: true },
    ];

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, message } = req.body;

    // Simulate creating a notification (replace with actual database logic)
    const newNotification = {
      id: Date.now(), // Simulated unique ID
      userId,
      message,
      read: false,
      createdAt: new Date(),
    };

    // Respond with the created notification
    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};
