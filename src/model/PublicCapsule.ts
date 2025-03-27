import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IPublicCapsule extends Document {
  title: string;
  content: string;
  media?: string;
  visibility: 'public' | 'featured';
  creator: Types.ObjectId;
  unlockAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const PublicCapsuleSchema = new Schema<IPublicCapsule>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  media: { type: String, default: null },
  visibility: { type: String, enum: ['public', 'featured'], required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unlockAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const PublicCapsule: Model<IPublicCapsule> = mongoose.model<IPublicCapsule>('PublicCapsule', PublicCapsuleSchema);

export { PublicCapsule, IPublicCapsule };
