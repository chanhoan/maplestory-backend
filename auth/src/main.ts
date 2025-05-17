import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new ConsoleLogger('Auth');
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 4001);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MapleStory Auth API')
    .setDescription('메이플스토리 MSA Auth API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`Gateway server listening on port: ${port}`);
}
bootstrap();
