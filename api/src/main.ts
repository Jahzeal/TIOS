import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(config.port);
  console.log(`[TIOS API (NestJS)] Server is running on port ${config.port}`);
  console.log(`[TIOS API (NestJS)] Webhook voice URL: http://localhost:${config.port}/voice`);
}

bootstrap();
