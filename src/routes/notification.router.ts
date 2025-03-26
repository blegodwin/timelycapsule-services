import express from "express";
import { NotificationController } from "../controllers/notification.controller";
import auth from "../middleware/auth";

const notificationRouter = (router: express.Router) => {
  router.use(express.json());
  router.post("/notifications", async (req, res) => {
    await NotificationController.createNotification(req, res);
  });

  router.get("/notifications", async (req, res) => {
    await NotificationController.getAllNotifications(req, res);
  });

  router.get("/notifications/:id", async (req, res) => {
    await NotificationController.getNotificationById(req, res);
  });

  router.patch("/notifications/:id", async (req, res) => {
    await NotificationController.updateNotification(req, res);
  });

  router.delete("/notifications/:id", async (req, res) => {
    await NotificationController.deleteNotification(req, res);
  });

  router.patch("/notifications/:id/read", async (req, res) => {
    await NotificationController.updateNotificationReadStatus(req, res);
  });
};

export default notificationRouter;
