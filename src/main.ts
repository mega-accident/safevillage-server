import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('SafeVillage API')
    .setDescription('안전마을 API 문서')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

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
