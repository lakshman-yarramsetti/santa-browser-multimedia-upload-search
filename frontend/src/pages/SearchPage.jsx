import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSearch, searchMedia } from '../features/search/searchSlice';
import MediaCard from '../components/MediaCard';

export default function SearchPage() {
  const dispatch = useDispatch();
  const {
    results,
    status,
    error,
    query: submittedQuery,
    hasSearched,
  } = useSelector((s) => s.search);

  const [query, setQuery] = useState(submittedQuery);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) dispatch(searchMedia(trimmed));
  };

  const clearInput = () => {
    setQuery('');
    dispatch(clearSearch());
  };

  const handleQueryChange = (event) => {
    const next = event.target.value;
    setQuery(next);
    if (!next.trim()) dispatch(clearSearch());
  };

  return (
    <>
      <h1>Search my files</h1>

      <form className="search-form" onSubmit={submit}>
        <span className="search-control">
          <input
            value={query}
            maxLength="80"
            placeholder="Search filename or tags"
            onChange={handleQueryChange}
          />

          {query && (
            <button
              className="search-clear"
              type="button"
              onClick={clearInput}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </span>

        <button disabled={!query.trim() || status === 'loading'}>
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {status === 'loading' && <p>Searching…</p>}

      {results.length > 0 && (
        <div className="media-grid">
          {results.map((media) => (
            <MediaCard
              key={media._id}
              media={media}
              previewFrom="/search"
            />
          ))}
        </div>
      )}

      {hasSearched &&
        status === 'idle' &&
        !error &&
        results.length === 0 && (
          <p className="empty">
            No matching files found in your library.
          </p>
        )}
    </>
  );
}