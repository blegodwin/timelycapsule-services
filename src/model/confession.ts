import mongoose, { type Document, Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export interface IConfession extends Document {
  text: string
  timestamp: Date
  sentiment?: string
  uuid: string
}

const ConfessionSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, "Confession text is required"],
    trim: true,
    maxlength: [1000, "Confession cannot be more than 1000 characters"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    default: "neutral",
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
})

// Create index for efficient querying by timestamp (for pagination)
ConfessionSchema.index({ timestamp: -1 })

export default mongoose.model<IConfession>("Confession", ConfessionSchema)

