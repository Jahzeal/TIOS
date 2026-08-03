import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'https://tios-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, origin?: boolean) => void) => {
      // Allow non-browser requests (like Twilio webhooks, Postman, server-to-server)
      if (!requestOrigin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(config.port);
  console.log(`[TIOS API (NestJS)] Server is running on port ${config.port}`);
  console.log(`[TIOS API (NestJS)] Webhook voice URL: http://localhost:${config.port}/voice`);
}

bootstrap();
