import './instrument';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLambdaModule } from './app-lambda.module';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

let cachedApp: NestExpressApplication | null = null;

// On Vercel serverless, always skip Bull/Redis regardless of REDIS_URL.
// Bull's persistent TCP connections hang the event loop in a stateless environment.
const ActiveModule = (process.env.VERCEL || !process.env.REDIS_URL) ? AppLambdaModule : AppModule;

export async function createNestApp(AppModuleClass = ActiveModule): Promise<NestExpressApplication> {
  const expressApp = express();
  
  // Root info + health — respond before NestJS initialises (no 404 on bare domain)
  expressApp.get('/', (_req, res) => {
    res.json({
      name: 'PrintCity API',
      version: '1.0.0',
      status: 'running',
      docs: '/docs',
      health: '/health',
    });
  });
  expressApp.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  // /api alone has no NestJS controller — return useful info instead of 404
  expressApp.get('/api', (_req, res) => {
    res.json({
      name: 'PrintCity API',
      version: '1.0.0',
      status: 'running',
      docs: '/docs',
      health: '/health',
      note: 'API routes are at /api/<resource> e.g. /api/products, /api/auth/login',
    });
  });
  // Silence browser favicon requests
  expressApp.get('/favicon.ico', (_req, res) => res.status(204).end());
  expressApp.get('/favicon.png', (_req, res) => res.status(204).end());

  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create<NestExpressApplication>(AppModuleClass, adapter, {
    rawBody: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const isDev = process.env.NODE_ENV !== 'production';
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Swagger UI needs inline scripts and CDN assets
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'unpkg.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'unpkg.com', 'fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'fonts.gstatic.com', 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isDev ? null : [],
      },
    },
    crossOriginEmbedderPolicy: false, // Swagger UI cross-origin assets
  }));

  app.enableCors({
    origin: isDev
      ? true
      : (origin: string | undefined, cb: (e: Error | null, allow?: boolean) => void) => {
          if (!origin) return cb(null, true);
          // Comma-separated FRONTEND_URL list (supports custom domains + both www/non-www)
          const allowed = (process.env.FRONTEND_URL ?? '').split(',').map(u => u.trim()).filter(Boolean);
          const isAllowed =
            allowed.some(u => origin === u || origin.startsWith(u)) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.printcity.com.np');
          if (isAllowed) return cb(null, true);
          cb(new Error(`CORS: ${origin} not allowed`));
        },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'x-csrf-token'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PrintCity API')
    .setDescription('PrintCity — Custom Print Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.init();
  return app;
}

// Vercel serverless handler — (req, res) style required by @vercel/node
export default async (req: any, res: any) => {
  if (!cachedApp) {
    cachedApp = await createNestApp();
  }
  cachedApp.getHttpAdapter().getInstance()(req, res);
};
