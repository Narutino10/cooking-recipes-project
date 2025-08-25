import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Allow configuring the frontend origin via env, fallback to localhost:3000
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Serve uploaded files from /uploads
  const uploadPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadPath));

  // Listen on the port provided by env (used by docker-compose) or default to 3001
  const port = parseInt(
    process.env.PORT || process.env.BACKEND_PORT || '3001',
    10,
  );
  // Bind to 0.0.0.0 so the server is reachable from outside the container
  await app.listen(port, '0.0.0.0');
  // Helpful log to verify the effective URL in container logs
  console.log(`Nest application listening on: ${await app.getUrl()}`);
}

void bootstrap();
