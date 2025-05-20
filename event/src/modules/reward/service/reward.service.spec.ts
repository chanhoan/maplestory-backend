import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { RewardRepository } from '../repository/reward.repository';
import { NotFoundException } from '@nestjs/common';
import { RewardType } from '../../../common/type/reward.type';

describe('RewardService', () => {
  let service: RewardService;
  let repo: jest.Mocked<RewardRepository>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findByFilters: jest.fn(),
      findByEvent: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardService, { provide: RewardRepository, useValue: repo }],
    }).compile();

    service = module.get<RewardService>(RewardService);
    (service as any).rewardRepository = repo;
  });

  describe('register', () => {
    it('should create reward with POINT metadata', async () => {
      const dto = { eventId: 'e1', type: RewardType.POINT, amount: 200 } as any;
      const created = {
        id: 'r1',
        eventId: 'e1',
        type: RewardType.POINT,
        metadata: { amount: 200 },
      } as any;
      repo.create.mockResolvedValue(created);

      const res = await service.register(dto);
      expect(repo.create).toHaveBeenCalledWith({
        eventId: 'e1',
        type: RewardType.POINT,
        metadata: { amount: 200 },
      });
      expect(res).toEqual({
        status: 'SUCCESS',
        message: '보상 등록 성공',
        id: 'r1',
        eventId: 'e1',
      });
    });
  });

  describe('getFilterRewards', () => {
    it('should return mapped rewards list', async () => {
      const docs = [
        {
          id: 'r2',
          eventId: 'e2',
          type: RewardType.POINT,
          metadata: { amount: 50 },
        } as any,
      ];
      repo.findByFilters.mockResolvedValue(docs);

      const res = await service.getFilterRewards({ eventId: 'e2' } as any);
      expect(repo.findByFilters).toHaveBeenCalledWith({
        deleteAt: { $exists: false },
        eventId: 'e2',
      });
      expect(res.rewards).toHaveLength(1);
      expect(res).toEqual({
        status: 'SUCCESS',
        message: '모든 보상 조회 성공',
        rewards: docs.map((r) => ({
          id: r.id,
          eventId: r.eventId,
          type: r.type,
          metadata: r.metadata,
        })),
      });
    });
  });

  describe('getReward', () => {
    it('throws NotFoundException if no reward', async () => {
      repo.findByEvent.mockResolvedValue(null as any);
      await expect(service.getReward('e3')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns reward detail when found', async () => {
      const doc = {
        id: 'r3',
        eventId: 'e3',
        type: RewardType.POINT,
        metadata: { amount: 75 },
      } as any;
      repo.findByEvent.mockResolvedValue(doc);

      const res = await service.getReward('e3');
      expect(repo.findByEvent).toHaveBeenCalledWith('e3');
      expect(res).toEqual({
        status: 'SUCCESS',
        message: '보상 조회 성공',
        reward: {
          id: 'r3',
          eventId: 'e3',
          type: RewardType.POINT,
          metadata: { amount: 75 },
        },
      });
    });
  });
});
