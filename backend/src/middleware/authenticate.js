import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  ACCESS_COOKIE,
  verifyAccessToken,
} from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[ACCESS_COOKIE];

  if (!token) {
    throw new AppError('Authentication is required.', 401);
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub).select(
      '_id name email'
    );

    if (!user) {
      throw new AppError(
        'The authenticated user no longer exists.',
        401
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      'Your session has expired. Please refresh or sign in again.',
      401
    );
  }
});