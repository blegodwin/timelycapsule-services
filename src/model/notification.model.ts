import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  contentType: string;
  isRead: boolean;
  userId: mongoose.Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    contentType: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);
