import mongoose, { Schema, Document } from "mongoose";

// Defined the GuestCapsule interface
interface IGuestCapsule extends Document {
  name: string;
  email: string;
  message: string;
  accessCode: string;
  expirationDate: Date;
  createdAt: Date;
}

// Defined the schema based on the provided Google Document guidelines
const GuestCapsuleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Guest email is required"],
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    accessCode: {
      type: String,
      required: [true, "Access code is required"],
      unique: true,
    },
    expirationDate: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const GuestCapsule = mongoose.model<IGuestCapsule>("GuestCapsule", GuestCapsuleSchema);

export default GuestCapsule;
