import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from './gateway.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GatewayService', () => {
    let service: GatewayService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GatewayService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue({
                            auth: { url: 'http://auth' },
                            events: { url: 'http://events' },
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<GatewayService>(GatewayService);
    });

    it('경로에 따라 서비스 키를 올바르게 매핑해야 한다', () => {
        expect((service as any).matchServiceKey('/auth/login')).toBe('auth');
        expect((service as any).matchServiceKey('/events/list')).toBe('events');
    });

    it('알 수 없는 경로일 경우 BadRequestException을 던져야 한다', () => {
        expect(() => (service as any).matchServiceKey('/unknown/123')).toThrow(BadRequestException);
    });

    it('올바른 URL로 요청을 포워딩해야 한다', async () => {
        const fakeReq = {
            method: 'GET',
            path: '/events/items',
            originalUrl: '/events/items?foo=bar',
            headers: { authorization: 'Bearer tok' },
            body: {},
        } as any;
        mockedAxios.request.mockResolvedValue({ status: 200, data: { ok: true } });

        const result = await service.forward(fakeReq);
        expect(mockedAxios.request).toHaveBeenCalledWith(
            expect.objectContaining({
                url: 'http://events/events/items?foo=bar',
                method: 'GET',
            }),
        );
        expect(result).toEqual({ status: 200, data: { ok: true } });
    });
});
