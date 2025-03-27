import type { Request, Response } from "express"
import Subscription from "../model/subscription.model"
import User from "../model/user.model"
import { createSubscriptionSchema, updateSubscriptionSchema } from "../utils/joivalidators/subscription"
import logger from "../utils/logger.utils"

export interface SubscriptionRequest extends Request {
  user?: any
}

const calculateEndDate = (startDate: Date, planType: string): Date => {
  const date = new Date(startDate)

  switch (planType) {
    case "basic":
      date.setMonth(date.getMonth() + 1) // 1 month
      break
    case "premium":
      date.setMonth(date.getMonth() + 3) // 3 months
      break
    case "enterprise":
      date.setMonth(date.getMonth() + 12) // 12 months
      break
    default:
      date.setMonth(date.getMonth() + 1) // Default to 1 month
  }

  return date
}

const SubscriptionController = {
  createSubscription: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      // Validate request body
      const { error, value } = createSubscriptionSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        })
        return
      }

      // Check if user exists
      const user = await User.findById(userId)

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        })
        return
      }

      // Check if user already has an active subscription
      const activeSubscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      })

      if (activeSubscription) {
        res.status(400).json({
          success: false,
          message: "User already has an active subscription",
        })
        return
      }

      // Calculate end date and next billing date based on plan type
      const startDate = new Date()
      const endDate = calculateEndDate(startDate, value.planType)
      const nextBillingDate = new Date(endDate)

      // Create subscription
      const subscription = await Subscription.create({
        user: userId,
        ...value,
        startDate,
        endDate,
        nextBillingDate,
        status: value.transactionId ? "active" : "pending", // If transaction ID is provided, set status to active
      })

      logger.info(`Subscription created: ${subscription._id} for user: ${userId}`)

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      })
    } catch (err: any) {
      logger.error(`Error creating subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while creating subscription",
      })
    }
  },

  getSubscriptionById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Subscription ID is required",
        })
        return
      }

      const subscription = await Subscription.findById(id).populate("user", "firstName lastName email")

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Subscription not found",
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Subscription retrieved successfully",
        data: subscription,
      })
    } catch (err: any) {
      logger.error(`Error retrieving subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while retrieving subscription",
      })
    }
  },

  getUserSubscriptions: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      const subscriptions = await Subscription.find({ user: userId }).sort({ createdAt: -1 })

      res.status(200).json({
        success: true,
        message: "Subscriptions retrieved successfully",
        data: subscriptions,
      })
    } catch (err: any) {
      logger.error(`Error retrieving user subscriptions: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while retrieving subscriptions",
      })
    }
  },

  getActiveSubscription: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      })

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "No active subscription found",
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Active subscription retrieved successfully",
        data: subscription,
      })
    } catch (err: any) {
      logger.error(`Error retrieving active subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while retrieving active subscription",
      })
    }
  },

  updateSubscription: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Subscription ID is required",
        })
        return
      }

      // Validate request body
      const { error, value } = updateSubscriptionSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        })
        return
      }

      // Find subscription
      const subscription = await Subscription.findById(id)

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Subscription not found",
        })
        return
      }

      // Check if subscription belongs to user
      if (subscription.user.toString() !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to update this subscription",
        })
        return
      }

      // If plan type is changed, recalculate end date and next billing date
      if (value.planType && value.planType !== subscription.planType) {
        const startDate = new Date()
        const endDate = calculateEndDate(startDate, value.planType)
        const nextBillingDate = new Date(endDate)

        value.startDate = startDate
        value.endDate = endDate
        value.nextBillingDate = nextBillingDate
      }

      // Update subscription
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true },
      )

      logger.info(`Subscription updated: ${id} for user: ${userId}`)

      res.status(200).json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription,
      })
    } catch (err: any) {
      logger.error(`Error updating subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while updating subscription",
      })
    }
  },

  cancelSubscription: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Subscription ID is required",
        })
        return
      }

      // Find subscription
      const subscription = await Subscription.findById(id)

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Subscription not found",
        })
        return
      }

      // Check if subscription belongs to user
      if (subscription.user.toString() !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to cancel this subscription",
        })
        return
      }

      // Check if subscription is already cancelled
      if (subscription.status === "cancelled") {
        res.status(400).json({
          success: false,
          message: "Subscription is already cancelled",
        })
        return
      }

      // Update subscription status to cancelled and disable auto-renew
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          status: "cancelled",
          autoRenew: false,
          updatedAt: new Date(),
        },
        { new: true },
      )

      logger.info(`Subscription cancelled: ${id} for user: ${userId}`)

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: updatedSubscription,
      })
    } catch (err: any) {
      logger.error(`Error cancelling subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while cancelling subscription",
      })
    }
  },

  renewSubscription: async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const userId = req.user?._id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Subscription ID is required",
        })
        return
      }

      // Find subscription
      const subscription = await Subscription.findById(id)

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Subscription not found",
        })
        return
      }

      // Check if subscription belongs to user
      if (subscription.user.toString() !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to renew this subscription",
        })
        return
      }

      // Calculate new dates
      const startDate = new Date()
      const endDate = calculateEndDate(startDate, subscription.planType)
      const nextBillingDate = new Date(endDate)

      // Update subscription
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          status: "active",
          startDate,
          endDate,
          nextBillingDate,
          lastBillingDate: new Date(),
          autoRenew: true,
          updatedAt: new Date(),
        },
        { new: true },
      )

      logger.info(`Subscription renewed: ${id} for user: ${userId}`)

      res.status(200).json({
        success: true,
        message: "Subscription renewed successfully",
        data: updatedSubscription,
      })
    } catch (err: any) {
      logger.error(`Error renewing subscription: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while renewing subscription",
      })
    }
  },

  getAllSubscriptions: async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const skip = (page - 1) * limit

      const [subscriptions, total] = await Promise.all([
        Subscription.find()
          .populate("user", "firstName lastName email")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Subscription.countDocuments(),
      ])

      const totalPages = Math.ceil(total / limit)

      res.status(200).json({
        success: true,
        message: "Subscriptions retrieved successfully",
        data: {
          subscriptions,
          pagination: {
            currentPage: page,
            totalPages,
            totalSubscriptions: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      })
    } catch (err: any) {
      logger.error(`Error retrieving all subscriptions: ${err.message}`)
      res.status(500).json({
        success: false,
        message: err.message || "An error occurred while retrieving subscriptions",
      })
    }
  },
}

export { SubscriptionController }

