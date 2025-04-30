import mongoose, { Schema, Document } from 'mongoose';

// Types for unlock conditions and visibility
const TimeWindowSchema = new Schema({
  start: { type: Date },
  end: { type: Date },
}, { _id: false });

const UnlockConditionsSchema = new Schema({
  timeWindow: { type: TimeWindowSchema },
}, { _id: false });

const VisibilitySchema = new Schema({
  public: { type: Boolean, default: true },
}, { _id: false });

// Capsule Document interface
export interface SecretDropCapsuleDocument extends Document {
  creatorId: string;
  title: string;
  message: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  isActive: boolean;
  visibility: {
    public: boolean;
  };
  unlockConditions?: {
    timeWindow?: {
      start?: Date;
      end?: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Main Capsule Schema
const SecretDropCapsuleSchema = new Schema<SecretDropCapsuleDocument>(
  {
    creatorId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    isActive: { type: Boolean, default: true },

    visibility: {
      type: VisibilitySchema,
      default: { public: true },
    },

    unlockConditions: {
      type: UnlockConditionsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
SecretDropCapsuleSchema.index({ location: '2dsphere' });

export const SecretDropCapsuleModel = mongoose.model<SecretDropCapsuleDocument>(
  'SecretDropCapsule',
  SecretDropCapsuleSchema
);
