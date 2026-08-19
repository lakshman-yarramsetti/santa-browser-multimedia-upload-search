import { Router } from 'express';
import rateLimit from 'express-rate-limit';

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


const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const viewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 240,
  standardHeaders: true,
  legacyHeaders: false,
});
mediaRouter.use(authenticate);

mediaRouter.post('/upload', uploadLimiter, upload.single('file'), uploadMedia);

mediaRouter.get('/search', searchLimiter, searchMedia);

mediaRouter.get('/', listMedia);

mediaRouter.post('/:id/view', viewLimiter, recordView);

mediaRouter.get('/:id', getMediaById);