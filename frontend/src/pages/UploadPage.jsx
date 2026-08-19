import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadMedia } from '../features/media/mediaSlice';

const allowed = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [tags, setTags] = useState('');
  const [localError, setLocalError] = useState('');

  const { status, error } = useSelector((s) => s.media);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      return setLocalError('Choose a file.');
    }

    if (!allowed.includes(file.type)) {
      return setLocalError('That file type is not supported.');
    }

    if (file.size > 25 * 1024 * 1024) {
      return setLocalError('Files must be 25 MB or smaller.');
    }

    if (isPreparingFile) {
      return setLocalError('Your file is still being prepared.');
    }

    const result = await dispatch(
      uploadMedia({
        file,
        tags,
      })
    );

    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <section className="form-page">
      <h1>Upload media</h1>

      <p>
        Accepted: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM, MP3, WAV, OGG, and PDF.
        Maximum 25 MB.
      </p>

      <form onSubmit={submit}>
        <label>
          File

          <input
            type="file"
            required
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,audio/ogg,application/pdf"
            onChange={async (e) => {
              const selectedFile = e.target.files?.[0];

              setLocalError('');
              setFile(null);

              if (!selectedFile) return;

              if (selectedFile.size > 25 * 1024 * 1024) {
                setLocalError('Files must be 25 MB or smaller.');
                return;
              }

              if (selectedFile.type !== 'application/pdf') {
                setFile(selectedFile);
                return;
              }

              setIsPreparingFile(true);

              try {
                const bytes = await selectedFile.arrayBuffer();
                setFile(
                  new File([bytes], selectedFile.name, {
                    type: selectedFile.type,
                    lastModified: selectedFile.lastModified,
                  })
                );
              } catch {
                setLocalError('The selected PDF could not be read. Please select it again.');
              } finally {
                setIsPreparingFile(false);
              }
            }}
          />
        </label>

        {file && (
          <p className="muted">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}

        <label>
          Tags{' '}
          <span className="muted">
            (optional, comma-separated)
          </span>

          <input
            value={tags}
            maxLength="409"
            placeholder="travel, summer, beach"
            onChange={(e) => setTags(e.target.value)}
          />
        </label>

        {(localError || error) && (
          <p className="error">{localError || error}</p>
        )}

        <button disabled={status === 'loading' || isPreparingFile}>
          {status === 'loading'
            ? 'Uploading…'
            : isPreparingFile
              ? 'Preparing file…'
              : 'Upload file'}
        </button>
      </form>
    </section>
  );
}