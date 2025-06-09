import mongoose, { Model } from "mongoose";
import { Types } from "mongoose";

interface ICapsule extends ICapsuleMethods {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  recipients: Types.ObjectId[];
  unlockDate: Date;
  expirationDate?: Date; 
  mediaUrls: string[];
  message: string;
  theme?: string; 
  isPublic: boolean;
  password?: string; 
  status: "Pending" | "Unlocked" | "Expired";
  recipientEmail: string;
  capsuleLink: string;
  createdAt: Date;
}

const CapsuleSchema = new mongoose.Schema<ICapsule>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    unlockDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: false,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    message: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: false,
      select: false, // Won't be returned in queries by default
    },
    status: {
      type: String,
      enum: ["Pending", "Unlocked", "Expired"],
      default: "Pending",
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    capsuleLink: {
      type: String,
      required: true,
    },
    createdAt: {
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

interface ICapsuleMethods {
  isExpired(): boolean;
  isUnlocked(): boolean;
  updateStatus(): Promise<void>;
}

interface CapsuleModel extends Model<ICapsule, object, ICapsuleMethods> {
  findByRecipientEmail(email: string): Promise<ICapsule[]>;
  findByCreator(userId: Types.ObjectId): Promise<ICapsule[]>;
  findPublicCapsules(): Promise<ICapsule[]>;
}

// Instance methods
CapsuleSchema.methods.isExpired = function (): boolean {
  if (!this.expirationDate) return false;
  return new Date() > this.expirationDate;
};

CapsuleSchema.methods.isUnlocked = function (): boolean {
  return new Date() >= this.unlockDate;
};

CapsuleSchema.methods.updateStatus = async function (): Promise<void> {
  console.log("Updating status..."); // Added logging
  if (this.isExpired()) {
    this.status = "Expired";
  } else if (this.isUnlocked()) {
    this.status = "Unlocked";
  } else {
    this.status = "Pending";
  }
  await this.save();
  console.log("Status updated to:", this.status); // Added logging
};

// Static methods
CapsuleSchema.statics.findByRecipientEmail = function (email: string) {
  return this.find({ recipientEmail: email });
};

CapsuleSchema.statics.findByCreator = function (userId: Types.ObjectId) {
  return this.find({ creator: userId });
};

CapsuleSchema.statics.findPublicCapsules = function () {
  return this.find({ isPublic: true });
};


contributions: mongoose.Types.ObjectId[];
approvedContributions: mongoose.Types.ObjectId[];


contributions: [{
  type: Schema.Types.ObjectId,
  ref: 'Contribution',
}],
approvedContributions: [{
  type: Schema.Types.ObjectId,
  ref: 'Contribution',
}],


CapsuleSchema.pre<ICapsule>("save", function (next) {
  if (this.isExpired()) {
    this.status = "Expired";
  } else if (this.isUnlocked()) {
    this.status = "Unlocked";
  } else {
    this.status = "Pending";
  }
  next();
});

export const Capsule = mongoose.model<ICapsule, CapsuleModel>(
  "Capsule",
  CapsuleSchema
);
