import { Request, Response } from "express";
import Subscription from "../model/subscription.model";

const SubscriptionController = {
  createSubscription: async (req: Request, res: Response) => {
    try {
      const { userId, plan, status } = req.body;

      if (!userId || !plan) {
        return res
          .status(400)
          .json({ success: false, message: "User ID and Plan are required." });
      }

      const newSubscription = await Subscription.create({
        userId,
        plan,
        status: status || "active",
      });

      res.status(201).json({ success: true, data: newSubscription });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "An error occurred while creating subscription",
      });
    }
  },

  getAllSubscriptions: async (req: Request, res: Response) => {
    try {
      const subscriptions = await Subscription.find();
      res.status(200).json({ success: true, data: subscriptions });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Error fetching subscriptions",
      });
    }
  },

  getSubscriptionById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscription = await Subscription.findById(id);

      if (!subscription) {
        return res
          .status(404)
          .json({ success: false, message: "Subscription not found" });
      }

      res.status(200).json({ success: true, data: subscription });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Error fetching subscription",
      });
    }
  },

  updateSubscription: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      if (!updatedSubscription) {
        return res
          .status(404)
          .json({ success: false, message: "Subscription not found" });
      }

      res.status(200).json({ success: true, data: updatedSubscription });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Error updating subscription",
      });
    }
  },

  deleteSubscription: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedSubscription = await Subscription.findByIdAndDelete(id);

      if (!deletedSubscription) {
        return res
          .status(404)
          .json({ success: false, message: "Subscription not found" });
      }

      res.status(200).json({ success: true, message: "Subscription deleted" });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Error deleting subscription",
      });
    }
  },
};

export { SubscriptionController };
