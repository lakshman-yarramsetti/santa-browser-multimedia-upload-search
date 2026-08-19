# Santa Browser — Multimedia Upload & Search

Santa Browser is a full-stack multimedia library built for the Multimedia Upload & Search technical assessment. Authenticated users can upload, preview, search, and rank their own images, videos, audio files, and PDFs.

## Live application

- Live demo: https://santa-browser-frontend.vercel.app/
- API: https://santa-browser-backend.up.railway.app/api
- Swagger/OpenAPI: https://santa-browser-backend.up.railway.app/api/docs
- Health check: https://santa-browser-backend.up.railway.app/api/health

## Assessment objective

Provide a secure React and Node.js application where users manage their own multimedia library, search it by filename or tags, and receive results ranked by relevance, recency, and view activity.

## Features

- Registration, login, session restoration, logout, and protected frontend routes.
- HTTP-only JWT access and refresh cookies with refresh-token rotation.
- User-owned media records: users cannot list, search, or fetch another user's records through the API.
- Uploads for JPEG, PNG, GIF, WebP, MP4, MOV, WebM, MP3, WAV, OGG, and PDF files.
- 25 MB maximum upload size, enforced by the browser and backend.
- Cloudinary media storage with MongoDB metadata storage.
- Image, video, audio, and PDF previews from Cloudinary URLs.
- Filename and tag search with case-insensitive partial matching.
- Weighted relevance ranking using filename/tag matches, upload recency, and view count.
- Swagger API documentation, standard error responses, Helmet, CORS, and rate limiting.
- Android/Samsung provider-backed PDF handling: PDFs are materialized immediately after selection so Recommended/Recent picker sources remain readable when upload begins.

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, React Router, Redux Toolkit, Axios, SASS, Vite |
| Backend | Node.js, Express 5, Multer, Zod |
| Database | MongoDB Atlas through Mongoose |
| Media storage | Cloudinary |
| Authentication | JWT, bcrypt, HTTP-only cookies |
| API documentation | Swagger UI / OpenAPI 3.0 |
| Deployment | Vercel frontend and Railway backend |
| Testing | Jest and Supertest |

## Architecture

```text
React browser application (Vercel)
  → same-origin /api rewrite
  → Express API (Railway)
  → MongoDB Atlas for metadata
  → Cloudinary for media bytes and delivery URLs
```

The Vercel rewrite is configured in `frontend/vercel.json`. In production, the browser calls `/api`, which Vercel forwards to Railway.

## Repository structure

```text
frontend/
  src/
    api/             Axios client and refresh handling
    app/             Redux store
    components/      Layout, previews, cards, protected route
    features/        Auth, media, and search Redux slices
    pages/           Auth, library, upload, search, detail pages
    styles/           SASS styling
backend/
  src/
    config/          Environment, MongoDB, Cloudinary configuration
    controllers/     Auth and media request handlers
    docs/            OpenAPI definition
    middleware/      Authentication, uploads, errors
    models/          User and media schemas
    routes/          Auth and media routes
    services/        Tokens, Cloudinary, ranking
    validations/     Zod validation
```

## Upload flow

```text
UploadPage
  → Redux upload thunk
  → Axios (credentials enabled)
  → Vercel /api proxy
  → Railway Express route
  → JWT authentication
  → Multer MIME/size validation
  → Cloudinary upload stream
  → MongoDB Media metadata record
```

The metadata record contains the original filename, normalized filename, Cloudinary URL and public ID, resource type, MIME type, size, tags, upload time, owner, and view count.

### Supported file types

| Category | MIME types |
|---|---|
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Video | `video/mp4`, `video/quicktime`, `video/webm` |
| Audio | `audio/mpeg`, `audio/wav`, `audio/ogg` |
| Documents | `application/pdf` |

The maximum accepted upload is **25 MB**.

### Preview behavior

- Images: native image preview.
- Videos: native HTML video player.
- Audio: native HTML audio player.
- PDFs: inline detail-page frame with an open-in-new-tab fallback; library cards use a PDF placeholder.

### Android/Samsung PDFs

Some Android Recommended/Recent providers expose valid file metadata while their underlying content source becomes unavailable later. For PDFs only, the upload page reads the selected file immediately and creates a browser-owned `File` with the same bytes, filename, MIME type, and timestamp. This preserves normal Downloads, Windows, image, audio, and video behavior while supporting Samsung Recommended/Recent PDF selection.

## Authentication and authorization

- `POST /auth/register` creates a user and signs them in.
- `POST /auth/login` signs in with email and password.
- `POST /auth/refresh` rotates a valid stored refresh token and issues new cookies.
- `POST /auth/logout` revokes the current refresh token and clears cookies.
- `GET /auth/me` restores an existing session.

Access tokens default to 15 minutes and refresh tokens to 7 days. Both are HTTP-only; production cookies use `Secure` and `SameSite=None`. Passwords are hashed with bcrypt. Every media route requires an access cookie and scopes queries to the current user.

## Search and ranking

Search uses `GET /media/search?query=<query>` and matches a user's normalized filename or tags using a case-insensitive escaped regular expression. Queries must be non-empty and at most 80 characters.

The current relevance score is:

```text
10: exact filename match, otherwise 5: filename contains query
 8: each exact tag match, otherwise 4: each tag containing query
0–3: recency points (decrease each 30 days)
0–2: min(2, log10(viewCount + 1))
```

Ties are ordered by newest upload, then highest view count.

## API documentation

Swagger UI is available at:

https://santa-browser-backend.up.railway.app/api/docs

It documents registration, login, refresh, logout, current user, upload, list, search, media detail, view tracking, and health endpoints. Protected operations use the `accessToken` cookie authentication scheme.

## Environment variables

Create local environment files from the supplied examples.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend variables:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `PORT` | API port, defaults to `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | Local frontend origin for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ACCESS_TOKEN_SECRET` | Access JWT signing secret |
| `ACCESS_TOKEN_EXPIRES_IN` | Access-token lifetime, default `15m` |
| `REFRESH_TOKEN_SECRET` | Refresh JWT signing secret |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh-token lifetime, default `7d` |
| `MAX_FILE_SIZE` | Maximum bytes, default `26214400` |

Frontend variables:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Local API URL; defaults to `http://localhost:5000/api` in development |

## Local setup

### Prerequisites

- Node.js 20 or newer.
- A MongoDB Atlas database.
- A Cloudinary account with an upload-enabled product environment.

### MongoDB Atlas

1. Create a cluster and database user.
2. Allow your development IP address in Network Access.
3. Copy the database connection string into `MONGODB_URI`.

### Cloudinary

1. Create or use a Cloudinary cloud.
2. Copy the cloud name, API key, and API secret into the backend `.env` file.

### Backend

```bash
cd backend
npm install
npm run dev
```

The API starts on `http://localhost:5000` unless `PORT` is changed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite application normally starts on `http://localhost:5173`.

## Testing

```bash
cd backend
npm test
```

The Jest/Supertest suite covers registration, login, protected-route rejection, unsupported upload rejection, ownership-scoped media access, and search/ranking behavior. Run the frontend production build with:

```bash
cd frontend
npm run build
```

## Deployment

- Frontend: https://santa-browser-frontend.vercel.app/
- Backend: https://santa-browser-backend.up.railway.app/api
- API documentation: https://santa-browser-backend.up.railway.app/api/docs

Deploy the frontend as a Vercel project rooted at `frontend/`. Deploy the backend as a Railway project rooted at `backend/`, configuring the backend environment variables above. The production Vercel rewrite forwards `/api/*` to Railway.

## Error handling

The API uses centralized error middleware for validation, authentication, ownership, Multer size/type errors, duplicate records, malformed IDs, unknown routes, and unexpected server errors. The frontend presents request failures and loading states through Redux.

## Known limitations and assumptions

- Search supports filename/tag substring matching only; it has no file-type/date filters, pagination, user-selected sorting, fuzzy matching, or tokenized multi-keyword semantics.
- View count increments when a user opens a media detail page; it is not a unique-view metric.
- Cloudinary delivery behavior is governed by the configured Cloudinary account and browser support for the uploaded format.
- Upload MIME validation relies on the supplied MIME type; this project does not perform antivirus or byte-signature inspection.
- Real-time notifications are not implemented.
- API rate limits are per IP and intended to protect normal authenticated use, not to provide billing-grade quota enforcement.

## Bonus status

Implemented:

- Weighted relevance scoring with filename, tags, recency, and view count.

Not implemented:

- Real-time WebSocket/SSE updates.
- File-type/date filters.
- Pagination and user-controlled sorting.
- Fuzzy or tokenized multi-keyword search.

## License

This repository was created for a technical assessment.
