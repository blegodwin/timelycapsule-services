import sharp from 'sharp';
import { Media } from '../models/Media';
import { uploadToCloud, deleteFromCloud } from './cloudStorage';
import logger from '../config/logger';

export const processImage = async (media: any) => {
  try {
    // Download original from cloud
    const originalBuffer = await downloadFromCloud(media.filePath);

    // Resize and convert to WebP
    const processedBuffer = await sharp(originalBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate thumbnail
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    // Upload processed versions
    const processedKey = `processed/${media._id}.webp`;
    const thumbnailKey = `thumbnails/${media._id}.webp`;

    await uploadToCloud(processedBuffer, processedKey, 'image/webp');
    await uploadToCloud(thumbnailBuffer, thumbnailKey, 'image/webp');

    // Update metadata
    const metadata = await sharp(processedBuffer).metadata();
    media.metadata = {
      width: metadata.width,
      height: metadata.height,
      format: 'webp',
    };
    media.thumbnail = thumbnailKey;

    // Replace original with processed version
    await deleteFromCloud(media.filePath);
    media.filePath = processedKey;

    logger.info(`Image processed: ${media._id}`);
  } catch (error) {
    logger.error(`Image processing error: ${media._id} - ${error.message}`);
    throw error;
  }
};
