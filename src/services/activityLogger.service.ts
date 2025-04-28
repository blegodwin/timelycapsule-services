import mongoose from 'mongoose';
import {
	ActivityLog,
	IActivityLog,
	IActivityLogMetadata,
} from '../models/activityLog.model';

interface LogData {
	userId?: mongoose.Types.ObjectId | string;
	action: string;
	metadata?: IActivityLogMetadata;
}

export class ActivityLogger {

	static async log(logData: LogData): Promise<boolean> {
		const loggingPromise = (async (): Promise<boolean> => {
			try {

				const sanitizedData = this.sanitizeLogData(logData);

				// Create and save the log entry
				const logEntry = new ActivityLog(sanitizedData);
				await logEntry.save();

				return true;
			} catch (error) {
				console.error('Activity logging error:', error);
				return false;
			}
		})();

		return loggingPromise;
	}

	static sanitizeLogData(logData: LogData): LogData {
		// Create a copy to avoid modifying the original
		const sanitized: LogData = { ...logData };

		const sensitiveFields = [
			'password',
			'passwordHash',
			'token',
			'secret',
			'apiKey',
			'credit_card',
		];

		// Remove sensitive fields from metadata if they exist
		if (sanitized.metadata && typeof sanitized.metadata === 'object') {
			sensitiveFields.forEach((field) => {
				if (field in sanitized.metadata!) {
					delete sanitized.metadata![field];
				}
			});
		}

		return sanitized;
	}
}
