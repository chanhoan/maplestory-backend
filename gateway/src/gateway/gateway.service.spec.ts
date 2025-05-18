import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from './gateway.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('GatewayService', () => {
  let service: GatewayService;
  let httpService: Partial<Record<keyof HttpService, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;

  const servicesConfig = {
    auth: { url: 'http://auth' },
    events: { url: 'http://events' },
  };

  beforeEach(async () => {
    httpService = {
      request: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue(servicesConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
  });

  describe('matchServiceKey', () => {
    it('should match first segment as key', () => {
      const key = (service as any).matchServiceKey('/auth/login');
      expect(key).toBe('auth');
    });

    it('should throw for unknown key', () => {
      expect(() => (service as any).matchServiceKey('/unknown/path')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('forward', () => {
    const mockReq: any = {
      path: '/auth/test',
      url: '/test?query=1',
      method: 'POST',
      headers: { host: 'localhost', 'content-length': '123', other: 'h' },
      body: { foo: 'bar' },
    };

    it('should forward with override key and return data', async () => {
      httpService.request.mockReturnValue(
        of({ status: 200, data: { ok: true } }),
      );

      const res = await service.forward(mockReq, 'auth');
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://auth/test?query=1',
        data: { foo: 'bar' },
        headers: { other: 'h', 'x-forwarded-user': undefined },
        validateStatus: expect.any(Function),
      });
      expect(res).toEqual({ status: 200, data: { ok: true } });
    });

    it('should embed user header if present', async () => {
      const user = {
        userId: 'u',
        username: 'u1',
        role: 'USER',
        expiresIn: 1000,
        jti: 'j',
      };
      const reqWithUser = { ...mockReq, headers: { other: 'h' }, user };
      httpService.request.mockReturnValue(
        of({ status: 200, data: { ok: true } }),
      );

      const res = await service.forward(reqWithUser as any, undefined);
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-forwarded-user': expect.any(String),
          }),
        }),
      );
      expect(res.data.ok).toBe(true);
    });

    it('should throw HttpException on non-2xx status', async () => {
      httpService.request.mockReturnValue(
        of({ status: 400, data: { error: 'Bad' } }),
      );
      await expect(service.forward(mockReq, 'auth')).rejects.toBeInstanceOf(
        HttpException,
      );
    });

    it('should throw InternalServerErrorException on network error', async () => {
      httpService.request.mockReturnValue(
        throwError(() => new Error('network fail')),
      );
      await expect(service.forward(mockReq, 'auth')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
