import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env, validateEnvironment } from './config/env.js';

try {
  validateEnvironment();
  await connectDatabase();

  app.listen(env.port, () =>
    console.log(`API listening on port ${env.port}`)
  );
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exit(1);
}