import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

if (env.nodeEnv === 'development') {
  dns.setServers(['1.1.1.1', '1.0.0.1']);
}

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');
}


