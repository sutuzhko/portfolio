// Поднимает приложение без БД, собирает OpenAPI-документ и пишет его в
// packages/contract/openapi.json. Пакет contract затем генерит из него TS-типы.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '../app.module';
import { swaggerConfig } from '../swagger.config';

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const outFile = resolve(__dirname, '../../../../packages/contract/openapi.json');

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(document, null, 2)}\n`);

  await app.close();

  console.log(`OpenAPI-документ записан в ${outFile}`);
}

void generate();
