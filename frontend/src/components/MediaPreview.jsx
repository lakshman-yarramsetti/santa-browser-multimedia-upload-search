function PdfPlaceholder() {
  return (
    <div className="pdf-placeholder" aria-hidden="true">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6M9 17h4" />
      </svg>
      <span>PDF</span>
    </div>
  );
}

export default function MediaPreview({
  media,
  compact = false,
  detail = false,
}) {
  const label = media.originalFilename || 'Uploaded media';

  if (media.resourceType === 'image') {
    return (
      <img
        className={
          detail
            ? 'media-preview media-preview--detail'
            : 'media-preview'
        }
        src={media.cloudinaryUrl}
        alt={label}
      />
    );
  }

  if (media.resourceType === 'video') {
    return (
      <video
        className={
          detail
            ? 'media-preview media-preview--detail'
            : 'media-preview'
        }
        controls
        preload="metadata"
      >
        <source src={media.cloudinaryUrl} type={media.mimeType} />
      </video>
    );
  }

  if (media.resourceType === 'audio') {
    return (
      <audio className="audio-preview" controls preload="metadata">
        <source src={media.cloudinaryUrl} type={media.mimeType} />
      </audio>
    );
  }

  if (compact) {
    return <PdfPlaceholder />;
  }

  const pdfUrl = media.cloudinaryUrl;

  return (
    <div className="pdf-detail">
      <iframe
        className="pdf-frame"
        src={pdfUrl}
        title={label}
      />
      <p className="muted pdf-fallback">
        If the PDF does not display above,{' '}
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          open it in a new tab
        </a>
        .
      </p>
    </div>
  );
}