import mongoose, { Schema, Document } from "mongoose";

interface IEngagementMetrics extends Document {
  userId: string;
  playCount: number;
  sessionDuration: number;
  skips: number;
}

const EngagementMetricsSchema = new Schema(
  {
    userId: { type: String, required: true },
    playCount: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    skips: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const EngagementMetrics = mongoose.model<IEngagementMetrics>(
  "EngagementMetrics",
  EngagementMetricsSchema
);
