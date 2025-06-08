import ffmpeg from 'fluent-ffmpeg';
import { Media } from '../model/Media';
import { uploadToCloud, downloadFromCloud } from './cloudStorage';
import logger from '../config/logger';
import fs from 'fs';
import util from 'util';
import path from 'path';

const mkdir = util.promisify(fs.mkdir);
const unlink = util.promisify(fs.unlink);

export const processAudio = async (media: any) => {
  const tempDir = path.join(__dirname, '../../temp');
  const tempInput = path.join(tempDir, `${media._id}-original`);
  const tempOutput = path.join(tempDir, `${media._id}-processed.mp3`);

  try {
    await mkdir(tempDir, { recursive: true });

    const buffer = await downloadFromCloud(media.filePath);
    fs.writeFileSync(tempInput, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .toFormat('mp3')
        .output(tempOutput)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const processedKey = `processed/${media._id}.mp3`;
    await uploadToCloud(
      fs.readFileSync(tempOutput),
      processedKey,
      'audio/mpeg'
    );

    media.filePath = processedKey;

    media.metadata = await getAudioMetadata(tempOutput);

    await unlink(tempInput);
    await unlink(tempOutput);

    logger.info(`Audio processed: ${media._id}`);
  } catch (error) {
    logger.error(`Audio processing error: ${media._id} - ${error.message}`);
    throw error;
  }
};

const getAudioMetadata = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve({
        duration: metadata.format.duration,
        format: 'mp3',
      });
    });
  });
};
