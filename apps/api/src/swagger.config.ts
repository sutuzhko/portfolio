import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Single source of the OpenAPI document config.
 * Shared by the running app (`/api/docs`) and the contract generator,
 * so the published contract always matches the live API.
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Portfolio API')
  .setDescription(
    'Console Portfolio backend. The OpenAPI document is the contract: frontend types are generated from it.',
  )
  .setVersion('0.0.0')
  .addCookieAuth('access_token')
  .build();
