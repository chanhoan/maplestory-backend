import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayController } from './auth.gateway.controller';
import { GatewayService } from './gateway.service';
import { Request } from 'express';

describe('AuthGatewayController', () => {
  let controller: AuthGatewayController;
  let gatewayService: Partial<Record<keyof GatewayService, jest.Mock>>;
  const mockResult = { success: true };
  const mockReq = {} as Request;

  beforeEach(async () => {
    gatewayService = {
      forward: jest.fn().mockReturnValue(mockResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGatewayController],
      providers: [{ provide: GatewayService, useValue: gatewayService }],
    }).compile();

    controller = module.get<AuthGatewayController>(AuthGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const methods = [
    { name: 'proxyRegister', method: () => controller.proxyRegister(mockReq) },
    { name: 'proxyLogin', method: () => controller.proxyLogin(mockReq) },
    { name: 'proxyLogout', method: () => controller.proxyLogout(mockReq) },
    { name: 'proxyRefresh', method: () => controller.proxyRefresh(mockReq) },
    { name: 'proxyGetInfo', method: () => controller.proxyGetInfo(mockReq) },
    { name: 'proxyUpdateInfo', method: () => controller.proxyUpdateInfo(mockReq) },
    { name: 'proxyDelete', method: () => controller.proxyDelete(mockReq) },
    { name: 'proxyGetAllUsers', method: () => controller.proxyGetAllUsers(mockReq) },
    { name: 'proxyUpdateRoles', method: () => controller.proxyUpdateRoles(mockReq) },
  ];

  methods.forEach(({ name, method }) => {
    it(`${name} should forward request to GatewayService`, () => {
      const result = method();
      expect(gatewayService.forward).toHaveBeenCalledWith(mockReq, 'auth');
      expect(result).toBe(mockResult);
    });
  });
});
