import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFilename: { type: String, required: true, trim: true },
    filenameNormalized: { type: String, required: true, trim: true },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, enum: ['image', 'video', 'audio', 'pdf'] },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
    uploadedAt: { type: Date, default: Date.now, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

mediaSchema.index({ owner: 1, uploadedAt: -1 });
mediaSchema.index({ owner: 1, filenameNormalized: 1, tags: 1 });

export const Media = mongoose.model('Media', mediaSchema);
