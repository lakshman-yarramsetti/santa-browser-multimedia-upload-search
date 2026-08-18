import { Router } from 'express';

import {
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
} from '../controllers/authController.js';

import { authenticate } from '../middleware/authenticate.js';

export const authRouter = Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/refresh', refresh);

authRouter.post('/logout', authenticate, logout);

authRouter.get('/me', authenticate, getCurrentUser);