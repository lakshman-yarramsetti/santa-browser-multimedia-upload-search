import { Link } from 'react-router-dom';
import MediaPreview from './MediaPreview';

export default function MediaCard({ media, previewFrom = '/' }) {
  return (
    <article className="media-card">
      <MediaPreview media={media} compact />

      <div className="media-card__body">
        <h3>{media.originalFilename}</h3>

        <p className="muted">
          {media.resourceType} ·{' '}
          {(media.fileSize / 1024 / 1024).toFixed(2)} MB
        </p>

        {media.tags?.length > 0 && (
          <div className="tags">
            {media.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <p className="muted">
          Uploaded {new Date(media.uploadedAt).toLocaleDateString()} ·{' '}
          {media.viewCount} views
        </p>

        <Link
          to={`/media/${media._id}`}
          state={{ from: previewFrom }}
        >
          Preview file
        </Link>
      </div>
    </article>
  );
}