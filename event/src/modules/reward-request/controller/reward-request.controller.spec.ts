import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from '../service/reward-request.service';
import { Request } from 'express';
import { RewardRequestRegisterResponse } from '../dto/response/reward-request.register.response';
import { GetAllRewardRequestResponse } from '../dto/response/get-all-reward-request-response';
import { GetRewardRequestResponse } from '../dto/response/get-reward-request.response';

describe('RewardRequestController', () => {
  let controller: RewardRequestController;
  let service: Partial<Record<keyof RewardRequestService, jest.Mock>>;
  const mockReq = { headers: {} } as Request;

  beforeEach(async () => {
    service = {
      register: jest
        .fn()
        .mockResolvedValue({} as RewardRequestRegisterResponse),
      getAllRequests: jest
        .fn()
        .mockResolvedValue({} as GetAllRewardRequestResponse),
      getRequest: jest.fn().mockResolvedValue({} as GetRewardRequestResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardRequestController],
      providers: [{ provide: RewardRequestService, useValue: service }],
    }).compile();

    controller = module.get<RewardRequestController>(RewardRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call service.register with eventId and req', async () => {
      const eventId = 'e1';
      const result: RewardRequestRegisterResponse = {
        status: 'SUCCESS',
        message: 'OK',
        id: 'r1',
        eventId,
      };
      (service.register as jest.Mock).mockResolvedValueOnce(result);

      const res = await controller.register(eventId, mockReq);
      expect(service.register).toHaveBeenCalledWith(eventId, mockReq);
      expect(res).toEqual(result);
    });
  });

  describe('getMyAllRequests', () => {
    it('should call service.getAllRequests with req and filter', async () => {
      const filter = { eventId: 'e1', status: 'PENDING' } as any;
      const result: GetAllRewardRequestResponse = {
        status: 'SUCCESS',
        message: 'OK',
        rewardRequests: [],
      };
      (service.getAllRequests as jest.Mock).mockResolvedValueOnce(result);

      const res = await controller.getMyAllRequests(mockReq, filter);
      expect(service.getAllRequests).toHaveBeenCalledWith(mockReq, filter);
      expect(res).toEqual(result);
    });
  });

  describe('findMyOne', () => {
    it('should call service.getRequest with req and id', async () => {
      const id = 'req1';
      const result: GetRewardRequestResponse = {
        status: 'SUCCESS',
        message: 'OK',
        rewardRequest: {
          id,
          userId: 'u1',
          eventId: 'e1',
          status: 'APPROVED',
        } as any,
      };
      (service.getRequest as jest.Mock).mockResolvedValueOnce(result);

      const res = await controller.findMyOne(mockReq, id);
      expect(service.getRequest).toHaveBeenCalledWith(mockReq, id);
      expect(res).toEqual(result);
    });
  });
});
