import mongoose, { Schema, Document } from 'mongoose';

export interface IStreak extends Document {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  milestoneRewards: {
    [key: number]: boolean; // e.g., { 7: true, 30: false }
  };
}

const StreakSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  currentStreak: { 
    type: Number, 
    default: 0 
  },
  longestStreak: { 
    type: Number, 
    default: 0 
  },
  lastActivityDate: { 
    type: Date, 
    default: null 
  },
  milestoneRewards: {
    type: Map,
    of: Boolean,
    default: {
      7: false,
      30: false,
      90: false,
      365: false
    }
  }
});

export const Streak = mongoose.model<IStreak>('Streak', StreakSchema);