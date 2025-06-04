import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  entityType: 'capsule' | 'user';
  entityId: mongoose.Types.ObjectId;

  period: 'daily' | 'weekly' | 'monthly';
  date: Date;

  metrics: {
    views: number;
    uniqueViews: number;
    reactions: number;
    shares: number;
    collaborators: number;
    mediaUploads: number;
    textContributions: number;
  };

  demographics?: {
    countries: Map<string, number>;
    ageGroups: Map<string, number>;
    devices: Map<string, number>;
  };

  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    entityType: {
      type: String,
      enum: ['capsule', 'user'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: function () {
        return this.entityType === 'capsule' ? 'Capsule' : 'User';
      },
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      collaborators: { type: Number, default: 0 },
      mediaUploads: { type: Number, default: 0 },
      textContributions: { type: Number, default: 0 },
    },
    demographics: {
      countries: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      ageGroups: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      devices: {
        type: Map,
        of: Number,
        default: new Map(),
      },
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index(
  {
    entityType: 1,
    entityId: 1,
    period: 1,
    date: 1,
  },
  { unique: true }
);

export const Analytics = mongoose.model<IAnalytics>(
  'Analytics',
  analyticsSchema
);