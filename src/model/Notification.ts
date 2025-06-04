import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type:
    | 'collaboration_invite'
    | 'capsule_unlocked'
    | 'reaction'
    | 'system'
    | 'reminder';
  title: string;
  message: string;

  relatedCapsule?: mongoose.Types.ObjectId;
  relatedCollaboration?: mongoose.Types.ObjectId;

  isRead: boolean;
  isEmailSent: boolean;

  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'collaboration_invite',
        'capsule_unlocked',
        'reaction',
        'system',
        'reminder',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    relatedCapsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
    },
    relatedCollaboration: {
      type: Schema.Types.ObjectId,
      ref: 'Collaboration',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);