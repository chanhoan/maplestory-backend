import * as nodeCrypto from 'crypto';

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { KafkaOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const logger = new ConsoleLogger('Events');
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 4002);

  const brokers = config.get<string>('KAFKA_BROKERS')!.split(',');
  const clientId = config.get<string>('KAFKA_CLIENT_ID');
  const groupId = config.get<string>('KAFKA_GROUP_ID') ?? 'event-service';

  logger.log(`brokers: ${brokers}`);

  const kafkaOptions: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId,
        brokers,
        retry: {
          initialRetryTime: 100,
          retries: 5,
        },
      },
      consumer: { groupId, allowAutoTopicCreation: true },
    },
  };

  app.connectMicroservice(kafkaOptions);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MapleStory Event API')
    .setDescription('메이플스토리 MSA Event API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(port);
  logger.log(`Event server listening on port: ${port}`);
}
bootstrap();
