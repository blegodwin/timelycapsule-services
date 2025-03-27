import type express from "express"
import { SubscriptionController } from "../controllers/subscription.controller"
import auth from "../middleware/auth"

const subscriptionRouter = (router: express.Router) => {
  // Create a new subscription
  router.post("/subscriptions", auth, SubscriptionController.createSubscription)

  // Get subscription by ID
  router.get("/subscriptions/:id", auth, SubscriptionController.getSubscriptionById)

  // Get all subscriptions for the authenticated user
  router.get("/user/subscriptions", auth, SubscriptionController.getUserSubscriptions)

  // Get active subscription for the authenticated user
  router.get("/user/subscription/active", auth, SubscriptionController.getActiveSubscription)

  // Update subscription
  router.patch("/subscriptions/:id", auth, SubscriptionController.updateSubscription)

  // Cancel subscription
  router.patch("/subscriptions/:id/cancel", auth, SubscriptionController.cancelSubscription)

  // Renew subscription
  router.patch("/subscriptions/:id/renew", auth, SubscriptionController.renewSubscription)

  // Get all subscriptions (admin only - would need admin middleware)
  router.get("/subscriptions", auth, SubscriptionController.getAllSubscriptions)
}

export default subscriptionRouter

