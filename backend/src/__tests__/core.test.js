import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const User = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
};

const Media = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

await jest.unstable_mockModule('../models/User.js', () => ({ User }));
await jest.unstable_mockModule('../models/Media.js', () => ({ Media }));

const { register, login } = await import('../controllers/authController.js');
const { getMediaById, listMedia, searchMedia } = await import('../controllers/mediaController.js');
const { authenticate } = await import('../middleware/authenticate.js');
const { upload } = await import('../middleware/upload.js');
const { errorHandler } = await import('../middleware/errorHandler.js');

const responseDouble = () => {
  const response = { cookie: jest.fn(), json: jest.fn(), status: jest.fn() };
  response.status.mockReturnValue(response);
  return response;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authentication', () => {
  test('registers a valid user and issues HTTP-only session cookies', async () => {
    const user = {
      _id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      refreshTokens: [],
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(user);
    const res = responseDouble();
    const next = jest.fn();

    await register({ body: { name: 'Ada', email: 'ada@example.com', password: 'Password1' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' } });
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(user.save).toHaveBeenCalled();
    expect(res.cookie.mock.calls[0][2]).toEqual(expect.objectContaining({ httpOnly: true }));
    expect(res.cookie.mock.calls[1][2]).toEqual(expect.objectContaining({ httpOnly: true }));
  });

  test('logs in with a valid password', async () => {
    const user = {
      _id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      passwordHash: await bcrypt.hash('Password1', 12),
      refreshTokens: [],
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const res = responseDouble();
    const next = jest.fn();

    await login({ body: { email: 'ada@example.com', password: 'Password1' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' } });
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });

  test('rejects an unauthenticated protected request', async () => {
    const app = express();
    app.use(cookieParser());
    app.get('/private', authenticate, (_req, res) => res.status(204).send());
    app.use(errorHandler);

    await request(app).get('/private').expect(401, { message: 'Authentication is required.' });
  });
});

describe('media protection and validation', () => {
  test('rejects an unsupported upload type before storage', async () => {
    const app = express();
    app.post('/upload', upload.single('file'), (_req, res) => res.status(201).send());
    app.use(errorHandler);

    await request(app)
      .post('/upload')
      .attach('file', Buffer.from('not media'), { filename: 'malware.exe', contentType: 'application/x-msdownload' })
      .expect(400, { message: 'Unsupported file type. Upload a supported image, video, audio file, or PDF.' });
  });

  test('lists only records queried with the authenticated owner', async () => {
    const records = [{ _id: 'media-1', owner: 'owner-1' }];
    const lean = jest.fn().mockResolvedValue(records);
    const sort = jest.fn().mockReturnValue({ lean });
    Media.find.mockReturnValue({ sort });
    const res = responseDouble();
    const next = jest.fn();

    await listMedia({ user: { _id: 'owner-1' } }, res, next);

    expect(Media.find).toHaveBeenCalledWith({ owner: 'owner-1' });
    expect(res.json).toHaveBeenCalledWith({ media: records });
    expect(next).not.toHaveBeenCalled();
  });

  test('does not reveal a media record outside the authenticated owner scope', async () => {
    Media.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const next = jest.fn();

    await getMediaById({ params: { id: 'other-media' }, user: { _id: 'owner-1' } }, responseDouble(), next);

    expect(Media.findOne).toHaveBeenCalledWith({ _id: 'other-media', owner: 'owner-1' });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});

describe('search and ranking', () => {
  test('returns owned filename/tag matches with relevance scores', async () => {
    const recent = { _id: '1', filenameNormalized: 'summer-video.mp4', tags: ['travel'], uploadedAt: new Date(), viewCount: 10 };
    const older = { _id: '2', filenameNormalized: 'other.mp4', tags: ['summer'], uploadedAt: new Date('2020-01-01'), viewCount: 0 };
    Media.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([older, recent]) });
    const res = responseDouble();
    const next = jest.fn();

    await searchMedia({ query: { query: 'summer' }, user: { _id: 'owner-1' } }, res, next);

    const payload = res.json.mock.calls[0][0];
    expect(Media.find).toHaveBeenCalledWith(expect.objectContaining({ owner: 'owner-1' }));
    expect(payload.count).toBe(2);
    expect(payload.media[0]._id).toBe('1');
    expect(payload.media[0].relevanceScore).toBeGreaterThan(payload.media[1].relevanceScore);
    expect(next).not.toHaveBeenCalled();
  });
});
