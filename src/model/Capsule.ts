import mongoose, { Document, Schema } from 'mongoose';

export interface ICapsule extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  creator: mongoose.Types.ObjectId;
  type: 'personal' | 'group' | 'public';
  visibility: 'private' | 'public' | 'unlisted';
  status: 'draft' | 'sealed' | 'unlocked' | 'expired';

  unlockDate?: Date;
  unlockPassword?: string;
  passwordHint?: string;

  unlockLocation?: {
    type: 'Point';
    coordinates: [number, number];
    radius: number;
    address?: string;
  };

  content: {
    text?: string;
    mediaFiles: mongoose.Types.ObjectId[];
    attachedFunds?: mongoose.Types.ObjectId;
  };

  tags: string[];
  category: string;

  stats: {
    views: number;
    reactions: number;
    shares: number;
    comments: number;
  };

  collaborators: mongoose.Types.ObjectId[];
  maxCollaborators?: number;
  deletedAt?: Date | null;
  sealedAt?: Date;
  unlockedAt?: Date;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const capsuleSchema = new Schema<ICapsule>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['personal', 'group', 'public'],
      required: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      default: 'private',
    },
    status: {
      type: String,
      enum: ['draft', 'sealed', 'unlocked', 'expired'],
      default: 'draft',
    },
    unlockDate: {
      type: Date,
      index: true,
    },
    unlockPassword: {
      type: String,
      select: false,
    },
    passwordHint: {
      type: String,
      maxlength: 200,
    },
    unlockLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return this.unlockLocation != null;
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.unlockLocation != null;
        },
      },
      radius: {
        type: Number,
        default: 100,
      },
      address: String,
    },
    content: {
      text: {
        type: String,
        maxlength: 10000,
      },
      mediaFiles: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Media',
        },
      ],
      attachedFunds: {
        type: Schema.Types.ObjectId,
        ref: 'Fund',
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stats: {
      views: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Collaboration',
      },
    ],
    maxCollaborators: {
      type: Number,
      default: 10,
      max: 50,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    sealedAt: Date,
    unlockedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

capsuleSchema.index({ creator: 1, status: 1 });
capsuleSchema.index({ unlockDate: 1, status: 1 });
capsuleSchema.index({ visibility: 1, status: 1 });
capsuleSchema.index({ tags: 1 });
capsuleSchema.index({ category: 1 });
capsuleSchema.index({ unlockLocation: '2dsphere' });
capsuleSchema.index({ createdAt: -1 });
capsuleSchema.index({ deletedAt: 1 });

capsuleSchema.virtual('timeRemaining').get(function () {
  if (!this.unlockDate || this.status === 'unlocked') return 0;
  return Math.max(0, this.unlockDate.getTime() - Date.now());
});

capsuleSchema.virtual('isUnlockable').get(function () {
  return (
    this.status === 'sealed' &&
    (!this.unlockDate || this.unlockDate <= new Date())
  );
});

export const Capsule = mongoose.model<ICapsule>('Capsule', capsuleSchema);
