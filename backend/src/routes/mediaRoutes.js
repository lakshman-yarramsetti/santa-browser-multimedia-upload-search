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

mediaRouter.use(authenticate);

mediaRouter.post('/upload', upload.single('file'), uploadMedia);

mediaRouter.get('/search', searchMedia);

mediaRouter.get('/', listMedia);

mediaRouter.post('/:id/view', recordView);

mediaRouter.get('/:id', getMediaById);