import multer from 'multer';

import { env } from '../config/env.js';

import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
]);

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: env.maxFileSize,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          'Unsupported file type. Upload a supported image, video, audio file, or PDF.',
          400
        )
      );
      return;
    }

    callback(null, true);
  },
});

export function mapMediaType(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'audio';
}