import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: Schema.Types.ObjectId;
  action: string;
  targetUser: Schema.Types.ObjectId;
  details: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  adminId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  action: { type: String, required: true },
  targetUser: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  details: String,
  createdAt: { type: Date, default: Date.now }
});

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);