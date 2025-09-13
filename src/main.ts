import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  app.enableShutdownHooks(); // 애플리케이션 종료 훅 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 이게 있어야 @Transform이 작동한다
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
bootstrap();
