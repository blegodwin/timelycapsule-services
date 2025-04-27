import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string | null;
  passwordHash: string | null;
  displayName: string;
  roles: string[];
  guest: boolean;
  isVerified: boolean;
  provider: 'local' | 'google' | 'github' | null;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, default: null },
  passwordHash: { type: String, default: null },
  displayName: { type: String, required: true },
  roles: { type: [String], default: ['user'] },
  guest: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  provider: { type: String, enum: ['local', 'google', 'github', null], default: 'local' },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', userSchema);
