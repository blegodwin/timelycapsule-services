import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IActivityLogMetadata {
	ip?: string;
	device?: string;
	guest?: boolean;
	provider?: string;
	[key: string]: any;
}

export interface IActivityLog extends Document {
	userId?: mongoose.Types.ObjectId | IUser;
	action: string;
	metadata: IActivityLogMetadata;
	createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false, //ensuring optional support for all guest users
	},
	action: {
		type: String,
		required: true,
		enum: [
			'login',
			'register',
			'guest_session_start',
			'upgrade',
			'password_reset',
		],
	},
	metadata: {
		ip: String,
		device: String,
		guest: Boolean,
		provider: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Index for faster queries by userId and date ranges
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>(
	'ActivityLog',
	activityLogSchema
);
