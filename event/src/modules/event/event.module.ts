import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';
import { EventService } from './service/event.service';
import { EventController } from './controller/event.controller';
import { EventRepository } from './repository/event.repository';
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    KafkaModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventRepository],
})
export class EventModule {}
