import { Test, TestingModule } from '@nestjs/testing';
import { EventProgressConsumer } from './event-progress.consumer';
import { EventProgressService } from '../service/event-progress.service';

describe('EventProgressConsumer', () => {
  let consumer: EventProgressConsumer;
  let progressService: Partial<Record<keyof EventProgressService, jest.Mock>>;

  beforeEach(async () => {
    progressService = {
      handleUserLogin: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventProgressConsumer],
      providers: [{ provide: EventProgressService, useValue: progressService }],
    }).compile();

    consumer = module.get<EventProgressConsumer>(EventProgressConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should call handleUserLogin on user.login event', async () => {
    const payload = { userId: 'user1' };
    await consumer.handleUserLogin(payload);
    expect(progressService.handleUserLogin).toHaveBeenCalledWith('user1');
  });
});
