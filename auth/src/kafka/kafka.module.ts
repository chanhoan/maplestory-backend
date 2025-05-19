import { Module } from '@nestjs/common';
import { ClientsModule, Transport, KafkaOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SASLOptions } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [],
        inject: [ConfigService],
        useFactory: (cfg: ConfigService): KafkaOptions => {
          const kafkaConfig = cfg.get<any>('kafka');

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: kafkaConfig.clientId,
                brokers: kafkaConfig.brokers,
                ssl: kafkaConfig.ssl,
                sasl: {
                  mechanism: 'scram-sha-256',
                  username: kafkaConfig.sasl.username,
                  password: kafkaConfig.sasl.password,
                } as SASLOptions,
              },
              consumer: {
                groupId: kafkaConfig.groupId,
              },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
