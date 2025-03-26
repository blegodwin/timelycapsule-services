import express from "express";
import { SubscriptionController } from "../controllers/subscription.controller";

const subscriptionRouter = (router: express.Router) => {
  router.post("/subscriptions", SubscriptionController.createSubscription);
  router.get("/subscriptions", SubscriptionController.getAllSubscriptions);
  router.get("/subscriptions/:id", SubscriptionController.getSubscriptionById);
  router.put("/subscriptions/:id", SubscriptionController.updateSubscription);
  router.delete("/subscriptions/:id", SubscriptionController.deleteSubscription);
};

export default subscriptionRouter;
