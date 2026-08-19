import { Router } from 'express';

import {
  getMediaById,
  listMedia,
  recordView,
  searchMedia,
  uploadMedia,
} from '../controllers/mediaController.js';

import { authenticate } from '../middleware/authenticate.js';

import { upload } from '../middleware/upload.js';

export const mediaRouter = Router();

// Temporary diagnostic logging for correlating browser upload attempts with Railway.
// It reads request metadata only and runs before authentication and Multer.
mediaRouter.use('/upload', (req, res, next) => {
  const debugUploadId = req.get('X-Debug-Upload-ID');

  console.info('[upload-debug] request reached Railway', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    contentType: req.get('content-type'),
    contentLength: req.get('content-length'),
    debugUploadId,
  });

  res.on('finish', () => {
    console.info('[upload-debug] Railway upload request finished', {
      debugUploadId,
      status: res.statusCode,
    });
  });

  next();
});

mediaRouter.use(authenticate);

mediaRouter.post('/upload', upload.single('file'), uploadMedia);

mediaRouter.get('/search', searchMedia);

mediaRouter.get('/', listMedia);

mediaRouter.post('/:id/view', recordView);

mediaRouter.get('/:id', getMediaById);