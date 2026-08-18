import { Media } from '../models/Media.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBuffer } from '../services/cloudinaryService.js';
import { createSearchRegex, rankMedia } from '../services/rankingService.js';
import { normalizeTags } from '../utils/tags.js';
import { mapMediaType } from '../middleware/upload.js';

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose one supported file to upload.', 400);
  let tags;
  try { tags = normalizeTags(req.body.tags); } catch (error) { throw new AppError(error.message, 400); }
  const resourceType = mapMediaType(req.file.mimetype);
  const uploaded = await uploadBuffer(req.file.buffer, resourceType, req.file.originalname);
  const media = await Media.create({
    owner: req.user._id,
    originalFilename: req.file.originalname,
    filenameNormalized: req.file.originalname.toLowerCase(),
    cloudinaryUrl: uploaded.secure_url,
    cloudinaryPublicId: uploaded.public_id,
    resourceType,
    mimeType: req.file.mimetype,
    fileSize: uploaded.bytes || req.file.size,
    tags,
  });
  res.status(201).json({ media });
});

export const listMedia = asyncHandler(async (req, res) => {
  const media = await Media.find({ owner: req.user._id }).sort({ uploadedAt: -1 }).lean();
  res.json({ media });
});

export const searchMedia = asyncHandler(async (req, res) => {
  const query = String(req.query.query || '').trim();
  if (!query) throw new AppError('Provide a non-empty search query.', 400);
  if (query.length > 80) throw new AppError('Search query must be 80 characters or fewer.', 400);
  const pattern = createSearchRegex(query);
  const matches = await Media.find({ owner: req.user._id, $or: [{ filenameNormalized: pattern }, { tags: pattern }] }).lean();
  res.json({ query, media: rankMedia(matches, query), count: matches.length });
});

export const getMediaById = asyncHandler(async (req, res) => {
  const media = await Media.findOne({ _id: req.params.id, owner: req.user._id }).lean();
  if (!media) throw new AppError('Media not found.', 404);
  res.json({ media });
});

export const recordView = asyncHandler(async (req, res) => {
  const media = await Media.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $inc: { viewCount: 1 } },
    { new: true },
  ).lean();
  if (!media) throw new AppError('Media not found.', 404);
  res.json({ media });
});
