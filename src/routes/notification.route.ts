// src/routes/notification.routes.ts
import { Router } from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../middleware/notificationMiddleware";

const router = Router();

// Route to create a new notification
router.post("/", createNotification);

// Route to get notifications for a specific user
router.get("/:userId", getNotifications);

// Route to mark a notification as read
router.patch("/:notificationId/read", markAsRead);

export default router;
