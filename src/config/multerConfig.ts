import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { Media } from '../models/Media';
import { Request } from 'express';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
];

// File validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed.`
      )
    );
  }
};

// Storage configuration
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME!,
  acl: 'private',
  metadata(req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Configure multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB limit
    files: 10, // Max 10 files per request
  },
});

// Thumbnail generator
export const generateThumbnail = async (file: Express.Multer.File) => {
  if (file.mimetype.startsWith('image/')) {
    return sharp(file.buffer)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
  return null;
};

// Metadata extractor
export const extractMetadata = async (file: Express.Multer.File) => {
  const metadata: any = {};

  if (file.mimetype.startsWith('image/')) {
    const imageMeta = await sharp(file.buffer).metadata();
    metadata.width = imageMeta.width;
    metadata.height = imageMeta.height;
    metadata.format = imageMeta.format;
  }

  if (
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('audio/')
  ) {
    metadata.duration = 0;
  }

  return metadata;
};

export const trackProgress = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let progress = 0;
  const fileSize = parseInt(req.headers['content-length'] || '0');

  req.on('data', (chunk) => {
    progress += chunk.length;
    const percentage = Math.round((progress / fileSize) * 100);

    console.log(`Upload progress: ${percentage}%`);
  });

  next();
};
