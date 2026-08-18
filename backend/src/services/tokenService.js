import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ms from 'ms';

import { env } from '../config/env.js';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export function createAccessToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'access' },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiresIn,
    }
  );
}

export function createRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiresIn,
    }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.accessTokenSecret);

  if (payload.type !== 'access') {
    throw new Error('Invalid access token.');
  }

  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.refreshTokenSecret);

  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token.');
  }

  return payload;
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}

function durationMs(value) {
  return typeof ms === 'function'
    ? ms(value)
    : 7 * 24 * 60 * 60 * 1000;
}

export function setAuthCookies(res, userId) {
  const accessToken = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);

  res.cookie(
    ACCESS_COOKIE,
    accessToken,
    cookieOptions(durationMs(env.accessTokenExpiresIn))
  );

  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(durationMs(env.refreshTokenExpiresIn))
  );

  return refreshToken;
}

export function clearAuthCookies(res) {
  const options = cookieOptions(0);

  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}

export const refreshExpiryDate = () =>
  new Date(
    Date.now() + durationMs(env.refreshTokenExpiresIn)
  );

export { ACCESS_COOKIE, REFRESH_COOKIE };