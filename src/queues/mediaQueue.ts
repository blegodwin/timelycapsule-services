import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { Media } from '../model/Media';
import { processImage } from '../utils/imageProcessor';
import { processVideo } from '../utils/videoProcessor';
import { processAudio } from '../utils/audioProcessor';
import logger from '../config/logger';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const mediaQueue = new Queue('media-processing', { connection });

export const startMediaWorker = () => {
  new Worker(
    'media-processing',
    async (job) => {
      const { mediaId } = job.data;
      const media = await Media.findById(mediaId);

      if (!media) throw new Error(`Media not found: ${mediaId}`);

      try {
        logger.info(`Processing media: ${mediaId}`);

        media.processingStatus = 'processing';
        await media.save();

        if (media.mimeType.startsWith('image/')) {
          await processImage(media);
        } else if (media.mimeType.startsWith('video/')) {
          await processVideo(media);
        } else if (media.mimeType.startsWith('audio/')) {
          await processAudio(media);
        }

        media.processingStatus = 'completed';
        await media.save();

        logger.info(`Media processed: ${mediaId}`);
        return { success: true };
      } catch (error) {
        media.processingStatus = 'failed';
        media.processingError = error.message;
        await media.save();
        logger.error(`Media processing failed: ${mediaId} - ${error.message}`);
        throw error;
      }
    },
    { connection }
  );

  logger.info('Media processing worker started');
};
