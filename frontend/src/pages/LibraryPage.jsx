import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLibrary } from '../features/media/mediaSlice';
import MediaCard from '../components/MediaCard';

export default function LibraryPage() {
  const dispatch = useDispatch();

  const { items, status, error } = useSelector((s) => s.media);

  useEffect(() => {
    dispatch(fetchLibrary());
  }, [dispatch]);

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>My Library</h1>
          <p>
            Only you can browse and search these records in the application.
          </p>
        </div>

        <Link className="button" to="/upload">
          Upload media
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {status === 'loading' ? (
        <p>Loading library…</p>
      ) : items.length ? (
        <div className="media-grid">
          {items.map((media) => (
            <MediaCard key={media._id} media={media} />
          ))}
        </div>
      ) : (
        <section className="empty">
          <h2>No uploads yet</h2>
          <p>
            Upload an image, video, audio file, or PDF to get started.
          </p>
        </section>
      )}
    </>
  );
}