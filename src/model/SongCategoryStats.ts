import mongoose, { Schema, Document } from "mongoose";

interface ISongCategoryStats extends Document {
  category: string;
  playCount: number;
}

const SongCategoryStatsSchema = new Schema(
  {
    category: { type: String, required: true },
    playCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const SongCategoryStats = mongoose.model<ISongCategoryStats>(
  "SongCategoryStats",
  SongCategoryStatsSchema
);
