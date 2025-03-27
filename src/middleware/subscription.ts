import type { Request, Response, NextFunction } from "express"
import { SubscriptionService } from "../services/subscription.service"
import logger from "../utils/logger.utils"

interface SubscriptionRequest extends Request {
  user?: any
}

/**
 * Middleware to check if a user has an active subscription
 * Use this middleware for routes that require an active subscription
 */
export const requireActiveSubscription = async (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      })
      return
    }

    const hasActiveSubscription = await SubscriptionService.hasActiveSubscription(userId.toString())

    if (!hasActiveSubscription) {
      res.status(403).json({
        success: false,
        message: "This action requires an active subscription",
      })
      return
    }

    next()
  } catch (err: any) {
    logger.error(`Error in subscription middleware: ${err.message}`)
    res.status(500).json({
      success: false,
      message: "Server error while checking subscription status",
    })
    return
  }
}

