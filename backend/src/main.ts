import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 4000;
  const prefix = config.get<string>('apiPrefix') ?? 'api/v1';
  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:3000';
  const isDev = config.get<string>('nodeEnv') === 'development';

  // ── Security ─────────────────────────────────────────────────────────────────
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(compression());
  app.use(cookieParser());

  // ── CORS ──────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global Prefix ─────────────────────────────────────────────────────────────
  app.setGlobalPrefix(prefix);

  // ── Validation ────────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Filters & Interceptors ─────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Swagger ───────────────────────────────────────────────────────────────────
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HospitalityOS AI — API')
      .setDescription(
        'Complete REST API for the HospitalityOS AI platform.\n\n' +
        '**Auth:** Use `POST /api/v1/auth/login` to get a JWT token, then click Authorize.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication & session management')
      .addTag('Dashboard', 'KPIs and live operations summary')
      .addTag('Reservations', 'Full reservation lifecycle — create, modify, check-in, check-out')
      .addTag('Rooms', 'Room inventory, status, and calendar')
      .addTag('Guests', 'Guest profiles and CRM')
      .addTag('Housekeeping', 'Task management and AI optimizer')
      .addTag('Revenue', 'Rate plans, rate grid, and AI recommendations')
      .addTag('Analytics', 'Revenue trends, channel breakdown, occupancy heatmap')
      .addTag('Users', 'Staff management')
      .addTag('Properties', 'Property and room type configuration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    Logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
  }

  await app.listen(port);
  Logger.log(`🚀 HospitalityOS AI Backend running on http://localhost:${port}/${prefix}`, 'Bootstrap');
}

bootstrap();
