import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from '../service/reward.service';
import { RewardRegisterRequest } from '../dto/request/reward.register.request';
import { RewardFilterRequest } from '../dto/request/reward.filter.request';
import { RewardRegisterResponse } from '../dto/response/reward.register.response';
import { GetAllRewardResponse } from '../dto/response/get-all-reward.response';
import { GetRewardResponse } from '../dto/response/get-reward.response';
import { RewardType } from '../../../common/type/reward.type';

describe('RewardController', () => {
  let controller: RewardController;
  let service: Partial<Record<keyof RewardService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      getFilterRewards: jest.fn(),
      getReward: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [{ provide: RewardService, useValue: service }],
    }).compile();

    controller = module.get<RewardController>(RewardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call rewardService.register and return response', async () => {
      const dto: RewardRegisterRequest = {
        eventId: 'e1',
        type: 'POINT',
        amount: 100,
      } as any;
      const result = {
        status: 'SUCCESS',
        message: 'OK',
        id: 'r1',
        eventId: 'e1',
      } as any as GetRewardResponse;
      (service.register as jest.Mock).mockResolvedValue(result);

      const res = await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(res).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should call rewardService.getFilterRewards and return list', async () => {
      const filter: RewardFilterRequest = {
        eventId: 'e1',
        type: 'POINT',
      } as any;
      const result: GetAllRewardResponse = {
        status: 'SUCCESS',
        message: 'OK',
        rewards: [],
      };
      (service.getFilterRewards as jest.Mock).mockResolvedValue(result);

      const res = await controller.findAll(filter);
      expect(service.getFilterRewards).toHaveBeenCalledWith(filter);
      expect(res).toEqual(result);
    });
  });

  describe('getReward', () => {
    it('should call rewardService.getReward and return detail', async () => {
      const eventId = 'e2';
      const result = {
        status: 'SUCCESS',
        message: 'OK',
        reward: {
          id: 'r2',
          eventId: 'e2',
          type: RewardType.POINT,
          metadata: { amount: 50 },
        },
      } as any as GetRewardResponse;
      (service.getReward as jest.Mock).mockResolvedValue(result);

      const res = await controller.getReward(eventId);
      expect(service.getReward).toHaveBeenCalledWith(eventId);
      expect(res).toEqual(result);
    });
  });
});
