import { join } from 'path';
import { mkdir } from 'fs/promises';
import { Logger } from '@nestjs/common';
import { createNestApp } from './main';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await createNestApp();

  const uploadsDir = join(process.cwd(), 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  const port = process.env.API_PORT ?? 4000;
  const activeModule = (process.env.VERCEL || !process.env.REDIS_URL) ? 'AppLambdaModule (Vercel/no-Redis)' : 'AppModule (full)';
  await app.getHttpAdapter().getHttpServer().listen(port);
  logger.log(`Active module: ${activeModule}`);
  logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`API running on http://localhost:${port}/api`);
  logger.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
