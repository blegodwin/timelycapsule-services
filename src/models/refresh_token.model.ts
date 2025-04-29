import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expiryDate: Date;
}

const RefreshTokenSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
