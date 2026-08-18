import { cloudinary } from '../config/cloudinary.js';

export function uploadBuffer(buffer, resourceType, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'santa-media',
        public_id: `${Date.now()}-${filename.replace(
          /[^a-zA-Z0-9_-]/g,
          '-'
        )}`,
        use_filename: false,
      },
      (error, result) =>
        error
          ? reject(error)
          : resolve({
              ...result,
              requestedType: resourceType,
            }),
    );

    stream.end(buffer);
  });
}