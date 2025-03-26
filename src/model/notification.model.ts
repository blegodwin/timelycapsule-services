import mongoose, { Document } from "mongoose";

// Define the Notification interface
interface INotification extends Document {
  title: string;
  message: string;
  user: mongoose.Types.ObjectId;
  type: "info" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Notification schema
const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create the Notification model
const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
