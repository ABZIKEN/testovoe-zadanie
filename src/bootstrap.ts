import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function createApp() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.enableShutdownHooks();
  await app.init();
  return app;
}
