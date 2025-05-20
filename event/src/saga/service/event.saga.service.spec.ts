import { Test, TestingModule } from '@nestjs/testing';
import { EventProgressRepository } from '../../modules/event-progress/repository/event-progress.repository';
import { RewardRequestRepository } from '../../modules/reward-request/repository/reward-request.repository';
import { EventSagaService } from './event.saga.service';

describe('EventSagaService', () => {
  let service: EventSagaService;
  let progressRepo: Partial<Record<keyof EventProgressRepository, jest.Mock>>;
  let rewardRepo: Partial<Record<keyof RewardRequestRepository, jest.Mock>>;

  beforeEach(async () => {
    progressRepo = {
      softDeleteByUser: jest.fn().mockResolvedValue(undefined),
      restoreByUser: jest.fn().mockResolvedValue(undefined),
    };
    rewardRepo = {
      softDeleteByUser: jest.fn().mockResolvedValue(undefined),
      restoreByUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventSagaService,
        { provide: EventProgressRepository, useValue: progressRepo },
        { provide: RewardRequestRepository, useValue: rewardRepo },
      ],
    }).compile();

    service = module.get<EventSagaService>(EventSagaService);
  });

  describe('softDeleteByUser', () => {
    it('should call both repos softDeleteByUser', async () => {
      const userId = 'user1';
      await service.softDeleteByUser(userId);
      expect(progressRepo.softDeleteByUser).toHaveBeenCalledWith(userId);
      expect(rewardRepo.softDeleteByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('restoreByUser', () => {
    it('should call both repos restoreByUser', async () => {
      const userId = 'user1';
      await service.restoreByUser(userId);
      expect(progressRepo.restoreByUser).toHaveBeenCalledWith(userId);
      expect(rewardRepo.restoreByUser).toHaveBeenCalledWith(userId);
    });
  });
});
