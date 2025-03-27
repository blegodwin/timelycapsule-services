import mongoose, { type Document, type Model, type Types } from "mongoose"

export interface ISubscription extends Document {
  user: Types.ObjectId
  planType: "basic" | "premium" | "enterprise"
  startDate: Date
  endDate: Date
  status: "active" | "cancelled" | "expired" | "pending"
  paymentMethod: "traditional" | "web3"
  walletAddress?: string
  price: number
  currency: string
  autoRenew: boolean
  lastBillingDate: Date
  nextBillingDate: Date
  transactionId?: string
  createdAt: Date
  updatedAt: Date

  // Methods
  isActive(): boolean
  daysRemaining(): number
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["traditional", "web3"],
      required: true,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    lastBillingDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    transactionId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Methods
SubscriptionSchema.methods.isActive = function (): boolean {
  return this.status === "active" && new Date() < this.endDate
}

SubscriptionSchema.methods.daysRemaining = function (): number {
  if (!this.isActive()) return 0

  const now = new Date()
  const end = new Date(this.endDate)
  const diffTime = Math.abs(end.getTime() - now.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Static methods
interface SubscriptionModel extends Model<ISubscription> {
  findActiveByUser(userId: string): Promise<ISubscription[]>
}

SubscriptionSchema.statics.findActiveByUser = function (userId: string) {
  return this.find({
    user: userId,
    status: "active",
    endDate: { $gt: new Date() },
  })
}

const Subscription = mongoose.model<ISubscription, SubscriptionModel>("Subscription", SubscriptionSchema)

export default Subscription

