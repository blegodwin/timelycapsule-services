import mongoose, { Schema, Document } from "mongoose";

interface ITokenStats extends Document {
  userId: string;
  amount: number;
  type: "earn" | "spend";
}

const TokenStatsSchema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["earn", "spend"], required: true }
  },
  { timestamps: true }
);

export const TokenStats = mongoose.model<ITokenStats>(
  "TokenStats",
  TokenStatsSchema
);
