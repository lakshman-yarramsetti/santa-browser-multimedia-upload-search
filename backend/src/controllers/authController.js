import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../validations/authValidation.js';
import { REFRESH_COOKIE, clearAuthCookies, hashToken, refreshExpiryDate, setAuthCookies, verifyRefreshToken } from '../services/tokenService.js';

const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email });

function saveRefreshToken(user, token) {
  user.refreshTokens = user.refreshTokens.filter((entry) => entry.expiresAt > new Date());
  user.refreshTokens.push({ tokenHash: hashToken(token), expiresAt: refreshExpiryDate() });
}

export const register = asyncHandler(async (req, res) => {
  const values = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: values.email });
  if (existing) throw new AppError('An account with that email already exists.', 409);

  const user = await User.create({
    name: values.name,
    email: values.email,
    passwordHash: await bcrypt.hash(values.password, 12),
  });
  const refreshToken = setAuthCookies(res, user._id.toString());
  saveRefreshToken(user, refreshToken);
  await user.save();
  res.status(201).json({ user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const values = loginSchema.parse(req.body);
  const user = await User.findOne({ email: values.email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(values.password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }
  const refreshToken = setAuthCookies(res, user._id.toString());
  saveRefreshToken(user, refreshToken);
  await user.save();
  res.json({ user: userResponse(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw new AppError('Refresh token is required.', 401);
  let payload;
  try { payload = verifyRefreshToken(token); } catch { throw new AppError('Refresh token is invalid or expired.', 401); }
  const user = await User.findById(payload.sub);
  const tokenHash = hashToken(token);
  if (!user || !user.refreshTokens.some((entry) => entry.tokenHash === tokenHash && entry.expiresAt > new Date())) {
    throw new AppError('Refresh token has been revoked.', 401);
  }
  user.refreshTokens = user.refreshTokens.filter((entry) => entry.tokenHash !== tokenHash && entry.expiresAt > new Date());
  const nextRefreshToken = setAuthCookies(res, user._id.toString());
  saveRefreshToken(user, nextRefreshToken);
  await user.save();
  res.json({ user: userResponse(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { tokenHash: hashToken(token) } } });
  }
  clearAuthCookies(res);
  res.status(204).send();
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
