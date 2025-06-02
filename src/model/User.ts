import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  preferences: {
    emailNotifications: boolean;
    publicProfile: boolean;
    defaultCapsuleVisibility: 'private' | 'public' | 'unlisted';
  };
  stats: {
    capsulesCreated: number;
    capsulesUnlocked: number;
    collaborationsJoined: number;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
      defaultCapsuleVisibility: {
        type: String,
        enum: ['private', 'public', 'unlisted'],
        default: 'private',
      },
    },
    stats: {
      capsulesCreated: {
        type: Number,
        default: 0,
      },
      capsulesUnlocked: {
        type: Number,
        default: 0,
      },
      collaborationsJoined: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model<IUser>('User', userSchema);