import ffmpeg from 'fluent-ffmpeg';
import { Media } from '../model/Media';
import { uploadToCloud, downloadFromCloud } from './cloudStorage';
import logger from '../config/logger';
import fs from 'fs';
import util from 'util';
import path from 'path';

const mkdir = util.promisify(fs.mkdir);
const unlink = util.promisify(fs.unlink);

export const processVideo = async (media: any) => {
  const tempDir = path.join(__dirname, '../../temp');
  const tempInput = path.join(tempDir, `${media._id}-original`);
  const tempOutput = path.join(tempDir, `${media._id}-processed.mp4`);
  const tempThumbnail = path.join(tempDir, `${media._id}-thumbnail.jpg`);

  try {
    await mkdir(tempDir, { recursive: true });

    const buffer = await downloadFromCloud(media.filePath);
    fs.writeFileSync(tempInput, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-movflags faststart',
        ])
        .output(tempOutput)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .screenshots({
          timestamps: ['50%'],
          filename: `${media._id}-thumbnail.jpg`,
          folder: tempDir,
          size: '300x300',
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const processedKey = `processed/${media._id}.mp4`;
    const thumbnailKey = `thumbnails/${media._id}.jpg`;

    await uploadToCloud(fs.readFileSync(tempOutput), processedKey, 'video/mp4');
    await uploadToCloud(
      fs.readFileSync(tempThumbnail),
      thumbnailKey,
      'image/jpeg'
    );

    media.filePath = processedKey;
    media.thumbnail = thumbnailKey;

    media.metadata = await getVideoMetadata(tempOutput);

    await unlink(tempInput);
    await unlink(tempOutput);
    await unlink(tempThumbnail);

    logger.info(`Video processed: ${media._id}`);
  } catch (error) {
    logger.error(`Video processing error: ${media._id} - ${error.message}`);
    throw error;
  }
};

const getVideoMetadata = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve({
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
        duration: metadata.format.duration,
        format: 'mp4',
      });
    });
  });
};
