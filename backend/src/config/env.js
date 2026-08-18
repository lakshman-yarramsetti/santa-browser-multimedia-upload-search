import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn:
    process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  maxFileSize: Number(
    process.env.MAX_FILE_SIZE || 26214400
  ),
};

export function validateEnvironment() {
  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}