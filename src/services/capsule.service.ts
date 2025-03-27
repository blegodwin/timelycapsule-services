import Capsule from "../model/capsule.model";
import { Types } from "mongoose";

// Define only the required properties for a capsule
type PartialCapsule = {
  title?: string;
  content?: string;
  media?: string | null;
  password?: string | null;
  recipientEmail?: string;
  recipientLink?: string;
  unlockAt?: Date;
  expiresAt?: Date;
  createdBy?: Types.ObjectId | null;
  isClaimed?: boolean;
  isGuest?: boolean;
  createdAt?: Date;
};

/** Create a new capsule */
export const createCapsule = async (data: PartialCapsule) => {
  return await Capsule.create(data);
};

/** Get a single capsule by ID */
export const getCapsuleById = async (id: string) => {
  return await Capsule.findById(id);
};

/** Get all capsules */
export const getAllCapsules = async () => {
  return await Capsule.find();
};

/** Get capsules by recipient email */
export const getCapsulesByRecipientEmail = async (email: string) => {
  return await Capsule.find({ recipientEmail: email });
};

/** Update a capsule */
export const updateCapsule = async (id: string, data: PartialCapsule) => {
  return await Capsule.findByIdAndUpdate(id, data, { new: true });
};

/** Delete a capsule */
export const deleteCapsule = async (id: string) => {
  return await Capsule.findByIdAndDelete(id);
};
