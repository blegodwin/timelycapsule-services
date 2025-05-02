import mongoose, { Document, Schema } from 'mongoose';


export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
export interface IUser extends Document {

  email: string | null;
  passwordHash: string | null;
  displayName: string;
  roles: UserRole;
  guest: boolean;
  isVerified: boolean;
  lastLoginAt: Date;
	provider: 'local' | 'google' | 'github' | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>({

  email: { type: String, default: null },
  passwordHash: { type: String, default: null },
  displayName: { type: String, required: true },
  roles: {
    type: String,
    enum: [UserRole.ADMIN, UserRole.USER, UserRole.GUEST],
    default: UserRole.USER,
  },
  guest: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  provider: { type: String, enum: ['local', 'google', 'github', null], default: 'local' },
	lastLoginAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;