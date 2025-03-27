import Subscription from "../model/subscription.model"
import logger from "../utils/logger.utils"

export const SubscriptionService = {
  /**
   * Check if a user has an active subscription
   * @param userId - The user ID to check
   * @returns boolean - Whether the user has an active subscription
   */
  hasActiveSubscription: async (userId: string): Promise<boolean> => {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: "active",
        endDate: { $gt: new Date() },
      })

      return !!subscription
    } catch (error: any) {
      logger.error(`Error checking active subscription: ${error.message}`)
      return false
    }
  },

  /**
   * Process subscription payment confirmation
   * @param subscriptionId - The subscription ID
   * @param transactionId - The transaction ID from payment processor
   * @returns The updated subscription or null if not found
   */
  confirmSubscriptionPayment: async (subscriptionId: string, transactionId: string) => {
    try {
      const subscription = await Subscription.findById(subscriptionId)

      if (!subscription) {
        logger.error(`Subscription not found: ${subscriptionId}`)
        return null
      }

      if (subscription.status !== "pending") {
        logger.warn(`Subscription ${subscriptionId} is not in pending status`)
        return subscription
      }

      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        {
          status: "active",
          transactionId,
          updatedAt: new Date(),
        },
        { new: true },
      )

      logger.info(`Subscription payment confirmed: ${subscriptionId}`)
      return updatedSubscription
    } catch (error: any) {
      logger.error(`Error confirming subscription payment: ${error.message}`)
      throw error
    }
  },

  /**
   * Check for expired subscriptions and update their status
   * This would typically be run by a scheduled job
   */
  processExpiredSubscriptions: async () => {
    try {
      const now = new Date()

      // Find subscriptions that have ended but are still marked as active
      const expiredSubscriptions = await Subscription.find({
        status: "active",
        endDate: { $lt: now },
      })

      logger.info(`Found ${expiredSubscriptions.length} expired subscriptions`)

      // Update each expired subscription
      for (const subscription of expiredSubscriptions) {
        if (subscription.autoRenew) {
          // Handle auto-renewal logic here
          // This would typically involve payment processing
          logger.info(`Auto-renewing subscription: ${subscription._id}`)
        } else {
          // Mark as expired
          await Subscription.findByIdAndUpdate(subscription._id, {
            status: "expired",
            updatedAt: now,
          })
          logger.info(`Marked subscription as expired: ${subscription._id}`)
        }
      }

      return expiredSubscriptions.length
    } catch (error: any) {
      logger.error(`Error processing expired subscriptions: ${error.message}`)
      throw error
    }
  },
}

