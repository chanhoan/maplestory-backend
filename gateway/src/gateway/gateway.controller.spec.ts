import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayController } from './auth.gateway.controller';
import { EventGatewayController } from './event.gateway.controller';
import { GatewayService } from './gateway.service';
import { Request } from 'express';

describe('AuthGatewayController', () => {
  let authController: AuthGatewayController;
  let gatewayService: GatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: {
            forward: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthGatewayController>(AuthGatewayController);
    gatewayService = module.get<GatewayService>(GatewayService);
  });

  it('proxyRegister should forward register request to auth service', async () => {
    const req = { path: '/api/auth/register' } as Request;
    const expected = { status: 201, data: { ok: true } };
    (gatewayService.forward as jest.Mock).mockResolvedValue(expected);

    await expect(authController.proxyRegister(req)).resolves.toEqual(expected);
    expect(gatewayService.forward).toHaveBeenCalledWith(req, 'auth');
  });

  it('proxyGetInfo should forward info GET request to auth service', async () => {
    const req = { path: '/api/auth/info' } as Request;
    const expected = { status: 200, data: { id: 1 } };
    (gatewayService.forward as jest.Mock).mockResolvedValue(expected);

    await expect(authController.proxyGetInfo(req)).resolves.toEqual(expected);
    expect(gatewayService.forward).toHaveBeenCalledWith(req, 'auth');
  });
});

describe('EventGatewayController', () => {
  let eventController: EventGatewayController;
  let gatewayService: GatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventGatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: {
            forward: jest.fn(),
          },
        },
      ],
    }).compile();

    eventController = module.get<EventGatewayController>(
      EventGatewayController,
    );
    gatewayService = module.get<GatewayService>(GatewayService);
  });

  it('proxyEvents should forward any event endpoint to events service', async () => {
    const req = {
      path: '/api/events/foo',
      method: 'GET',
      originalUrl: '/api/events/foo',
    } as Request;
    const expected = { status: 200, data: ['event1'] };
    (gatewayService.forward as jest.Mock).mockResolvedValue(expected);

    await expect(eventController.proxyEvents(req)).resolves.toEqual(expected);
    expect(gatewayService.forward).toHaveBeenCalledWith(req, 'events');
  });
});
