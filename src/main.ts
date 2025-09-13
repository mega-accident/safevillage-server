import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // 애플리케이션 종료 훅 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 이게 있어야 @Transform이 작동한다
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error); // 부트스트랩 과정에서 에러가 발생하면 콘솔에 출력, 부트스트랩이란 애플리케이션 초기화 과정
