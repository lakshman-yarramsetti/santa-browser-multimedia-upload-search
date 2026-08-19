import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMedia, recordView } from '../features/media/mediaSlice';
import { updateSearchResult } from '../features/search/searchSlice';
import MediaPreview from '../components/MediaPreview';

export default function MediaDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selected, status, error } = useSelector((s) => s.media);
  const fromSearch = location.state?.from === '/search';
  const backPath = fromSearch ? '/search' : '/';
  const backLabel = fromSearch ? '← Back to search' : '← Back to library';

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await dispatch(fetchMedia(id));
      if (!active || result.error) return;
      const viewResult = await dispatch(recordView(id));
      if (active && !viewResult.error) dispatch(updateSearchResult(viewResult.payload));
    })();

    return () => { active = false; };
  }, [dispatch, id]);

  if (status === 'loading' || !selected) {
    return error ? <p className="error">{error}</p> : <p>Loading preview…</p>;
  }

  return <section className="detail"><Link to={backPath}>{backLabel}</Link><h1>{selected.originalFilename}</h1><div className="detail-preview"><MediaPreview media={selected} detail /></div><div className="tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p className="muted">{selected.viewCount} views · Uploaded {new Date(selected.uploadedAt).toLocaleString()}</p></section>;
}