import mongoose, { Document, Schema } from 'mongoose';

export interface ICollaboration extends Document {
  _id: mongoose.Types.ObjectId;
  capsule: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'removed';
  role: 'contributor' | 'editor' | 'viewer';
  permissions: {
    canAddMedia: boolean;
    canEditContent: boolean;
    canInviteOthers: boolean;
    canSealCapsule: boolean;
  };
  contributions: {
    mediaUploaded: number;
    textAdded: number;
    lastContribution: Date;
  };
  invitedAt: Date;
  respondedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationSchema = new Schema<ICollaboration>(
  {
    capsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'removed'],
      default: 'pending',
    },
    role: {
      type: String,
      enum: ['contributor', 'editor', 'viewer'],
      default: 'contributor',
    },
    permissions: {
      canAddMedia: {
        type: Boolean,
        default: true,
      },
      canEditContent: {
        type: Boolean,
        default: false,
      },
      canInviteOthers: {
        type: Boolean,
        default: false,
      },
      canSealCapsule: {
        type: Boolean,
        default: false,
      },
    },
    contributions: {
      mediaUploaded: {
        type: Number,
        default: 0,
      },
      textAdded: {
        type: Number,
        default: 0,
      },
      lastContribution: {
        type: Date,
        default: Date.now,
      },
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    joinedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
collaborationSchema.index({ capsule: 1, user: 1 }, { unique: true });
collaborationSchema.index({ user: 1, status: 1 });
collaborationSchema.index({ invitedBy: 1 });
collaborationSchema.index({ invitedAt: -1 });

export const Collaboration = mongoose.model<ICollaboration>(
  'Collaboration',
  collaborationSchema
);