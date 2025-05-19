import { Module } from '@nestjs/common';
import { ClientsModule, Transport, KafkaOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        inject: [ConfigService],
        useFactory: (cs: ConfigService): KafkaOptions => {
          const brokers = cs.get<string>('KAFKA_BROKERS')!.split(',');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'event-producer',
                brokers,
                ssl: false,
                sasl: {
                  mechanism: 'scram-sha-256',
                  username: cs.get<string>('KAFKA_SASL_USERNAME')!,
                  password: cs.get<string>('KAFKA_SASL_PASSWORD')!,
                },
              },
              producerOnlyMode: true,
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
