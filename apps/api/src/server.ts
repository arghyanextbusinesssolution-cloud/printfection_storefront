import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Printfection UK API running on port ${env.PORT}`, {
      environment: env.NODE_ENV,
      storefront: env.STOREFRONT_URL,
      admin: env.ADMIN_URL,
    });
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
