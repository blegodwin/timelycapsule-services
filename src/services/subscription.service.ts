import Subscription, { ISubscription } from "../model/subscription.model";

/**
 * Create a new subscription
 */
export const createSubscription = async (data: ISubscription) => {
  try {
    const subscription = new Subscription(data);
    return await subscription.save();
  } catch (error) {
    throw new Error("Error creating subscription: " + error);
  }
};

/**
 * Retrieve a single subscription by ID
 */
export const getSubscriptionById = async (id: string) => {
  try {
    return await Subscription.findById(id).populate("userId");
  } catch (error) {
    throw new Error("Error retrieving subscription: " + error);
  }
};

/**
 * Retrieve all subscriptions
 */
export const getAllSubscriptions = async () => {
  try {
    return await Subscription.find().populate("userId");
  } catch (error) {
    throw new Error("Error retrieving subscriptions: " + error);
  }
};

/**
 * Update a subscription by ID
 */
export const updateSubscription = async (id: string, updateData: Partial<ISubscription>) => {
  try {
    return await Subscription.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw new Error("Error updating subscription: " + error);
  }
};

/**
 * Delete a subscription by ID
 */
export const deleteSubscription = async (id: string) => {
  try {
    return await Subscription.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting subscription: " + error);
  }
};
