import { Test, TestingModule } from '@nestjs/testing';
import { EventGatewayController } from './event.gateway.controller';
import { GatewayService } from './gateway.service';
import { Request } from 'express';

describe('EventGatewayController', () => {
  let controller: EventGatewayController;
  let gatewayService: Partial<Record<keyof GatewayService, jest.Mock>>;
  const mockResult = { success: true };
  const mockReq = {} as Request;

  beforeEach(async () => {
    gatewayService = {
      forward: jest.fn().mockReturnValue(mockResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventGatewayController],
      providers: [{ provide: GatewayService, useValue: gatewayService }],
    }).compile();

    controller = module.get<EventGatewayController>(EventGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const methods = [
    { name: 'proxyGetEvents', call: () => controller.proxyGetEvents(mockReq) },
    { name: 'proxyGetEvent', call: () => controller.proxyGetEvent(mockReq) },
    {
      name: 'proxyRegisterEvent',
      call: () => controller.proxyRegisterEvent(mockReq),
    },
    {
      name: 'proxyGetRewards',
      call: () => controller.proxyGetRewards(mockReq),
    },
    { name: 'proxyGetReward', call: () => controller.proxyGetReward(mockReq) },
    {
      name: 'proxyRegisterReward',
      call: () => controller.proxyRegisterReward(mockReq),
    },
    { name: 'register', call: () => controller.register(mockReq) },
    {
      name: 'getMyAllRequests',
      call: () => controller.getMyAllRequests(mockReq),
    },
    { name: 'findMyOne', call: () => controller.findMyOne(mockReq) },
  ];

  methods.forEach(({ name, call }) => {
    it(`${name} should forward request to GatewayService`, async () => {
      const result = await call();
      expect(gatewayService.forward).toHaveBeenCalledWith(mockReq, 'events');
      expect(result).toBe(mockResult);
    });
  });
});
