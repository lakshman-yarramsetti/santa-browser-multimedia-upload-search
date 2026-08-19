import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { openapiDefinition } from './docs/openapi.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { mediaRouter } from './routes/mediaRoutes.js';

export const app = express();

// Railway terminates TLS and forwards requests through one trusted proxy in production.
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  authRouter
);

app.use('/api/media', mediaRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDefinition));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(notFound);
app.use(errorHandler);