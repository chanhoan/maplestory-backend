import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';

describe('GatewayController', () => {
  let controller: GatewayController;
  let service: GatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: { forward: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GatewayController>(GatewayController);
    service = module.get<GatewayService>(GatewayService);
  });

  it('공개된 로그인 엔드포인트를 auth 서비스로 포워딩해야 한다', () => {
    const req: any = { url: 'auth/logout' };
    controller.proxyAuthUser(req);
    expect(service.forward).toHaveBeenCalledWith(req, 'auth');
  });

  it('공개된 로그인 엔드포인트를 auth 서비스로 포워딩해야 한다', () => {
    const req: any = { url: 'auth/login' };
    controller.proxyUser(req);
    expect(service.forward).toHaveBeenCalledWith(req, 'auth');
  });

  it('보호된 사용자 정보 조회 엔드포인트를 auth 서비스로 포워딩해야 한다', async () => {
    const req: any = { url: 'auth/roles' };
    await controller.proxyAuthAdmin(req);
    expect(service.forward).toHaveBeenCalledWith(req, 'auth');
  });

  it('이벤트 요청을 event 서비스로 포워딩해야 한다', async () => {
    const req: any = { url: 'events/events' };
    await controller.proxyEvents(req);
    expect(service.forward).toHaveBeenCalledWith(req, 'events');
  });
});
