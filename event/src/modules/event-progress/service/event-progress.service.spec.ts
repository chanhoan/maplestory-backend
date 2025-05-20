import { Test, TestingModule } from '@nestjs/testing';
import { EventProgressService } from './event-progress.service';
import { EventRepository } from '../../event/repository/event.repository';
import { EventProgressRepository } from '../repository/event-progress.repository';
import { RewardRequestRepository } from '../../reward-request/repository/reward-request.repository';

describe('EventProgressService', () => {
  let service: EventProgressService;
  let eventRepo: any;
  let progressRepo: any;
  let rewardRepo: any;
  let kafkaProducer: any;

  beforeEach(async () => {
    eventRepo = { findByTypeAndActive: jest.fn() };
    progressRepo = { upsertLoginProgress: jest.fn() };
    rewardRepo = { bulkApprove: jest.fn() };
    kafkaProducer = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventProgressService,
        { provide: EventRepository, useValue: eventRepo },
        { provide: EventProgressRepository, useValue: progressRepo },
        { provide: RewardRequestRepository, useValue: rewardRepo },
        { provide: 'KAFKA_PRODUCER', useValue: kafkaProducer },
      ],
    }).compile();

    service = module.get<EventProgressService>(EventProgressService);
  });

  describe('handleUserLogin', () => {
    const userId = 'user1';
    const mockEvent = { id: 'e1', _id: 'e1', conditionParams: { days: 2 } };

    it('approves reward when eligible', async () => {
      eventRepo.findByTypeAndActive.mockResolvedValue([mockEvent]);
      progressRepo.upsertLoginProgress.mockResolvedValue({ eligible: true });

      await service.handleUserLogin(userId);
      expect(progressRepo.upsertLoginProgress).toHaveBeenCalledWith(
        userId,
        mockEvent.id,
        2,
      );
      expect(rewardRepo.bulkApprove).toHaveBeenCalledWith({
        userId,
        eventId: mockEvent.id,
      });
      expect(kafkaProducer.emit).not.toHaveBeenCalled();
    });

    it('does not approve when not eligible', async () => {
      eventRepo.findByTypeAndActive.mockResolvedValue([mockEvent]);
      progressRepo.upsertLoginProgress.mockResolvedValue({ eligible: false });

      await service.handleUserLogin(userId);
      expect(rewardRepo.bulkApprove).not.toHaveBeenCalled();
    });

    it('retries on error and emits to DLQ after max retries', async () => {
      eventRepo.findByTypeAndActive.mockResolvedValue([mockEvent]);
      progressRepo.upsertLoginProgress.mockRejectedValue(new Error('db error'));

      await service.handleUserLogin(userId);
      // expect emit called twice: failed and dlq
      expect(kafkaProducer.emit).toHaveBeenCalledWith(
        'event.progress.failed',
        expect.any(Object),
      );
      expect(kafkaProducer.emit).toHaveBeenCalledWith(
        'event.progress.dlq',
        expect.any(Object),
      );
    });
  });
});
