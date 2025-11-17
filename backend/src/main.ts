import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  await app.listen(3001); // backend on port 3001
}

// Handle any startup error explicitly so ESLint is happy
bootstrap().catch((err) => {
  console.error('Error starting Nest application', err);
  process.exit(1);
});
