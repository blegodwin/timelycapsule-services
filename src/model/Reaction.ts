import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction extends Document {
  _id: mongoose.Types.ObjectId;
  capsule: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'laugh';
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    capsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'love', 'wow', 'sad', 'angry', 'laugh'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint - one reaction per user per capsule
reactionSchema.index({ capsule: 1, user: 1 }, { unique: true });
reactionSchema.index({ capsule: 1, type: 1 });

export const Reaction = mongoose.model<IReaction>('Reaction', reactionSchema);