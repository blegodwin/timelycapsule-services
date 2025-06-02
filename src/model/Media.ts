import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  _id: mongoose.Types.ObjectId;
  capsule: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  thumbnail?: string;

  // Media metadata
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for video/audio
    format?: string;
  };

  // Processing status
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;

  // Access control
  isPublic: boolean;
  downloadCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    capsule: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    thumbnail: String,
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
      format: String,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingError: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ capsule: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimeType: 1 });
mediaSchema.index({ processingStatus: 1 });
mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model<IMedia>('Media', mediaSchema);