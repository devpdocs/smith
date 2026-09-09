/**
 * API bootstrap.
 *
 * Loads the repo-root `.env` so runtime config (STRAPI_URL, STRAPI_ADMIN_API_TOKEN,
 * CONVEX_URL, API_PORT) is available regardless of the working directory, then
 * starts the NestJS app with a global `/api` prefix.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { AppModule } from './app/app.module';
import { ConfigService } from './config/config.service';

function loadEnv(): void {
  // Prefer the repo-root .env (single source of truth for the MVP); fall back to
  // the current working directory.
  const candidates = [
    resolve(__dirname, '../../../../.env'),
    resolve(process.cwd(), '.env'),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      dotenv.config({ path });
      return;
    }
  }
  dotenv.config();
}

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  const config = app.get(ConfigService);
  const port = config.port;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
