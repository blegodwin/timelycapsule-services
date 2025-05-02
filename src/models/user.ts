import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IUser extends Document {
    _id: string;
    name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: [UserRole.ADMIN, UserRole.USER],
      default: UserRole.USER,
    },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
