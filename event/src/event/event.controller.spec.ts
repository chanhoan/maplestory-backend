import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRegisterRequest } from './dto/request/event.register.request';
import { EventFilterRequest } from './dto/request/event.filter.request';
import { GetAllEventResponse } from './dto/response/get-all-event.response';
import { EventRegisterResponse } from './dto/response/event.register.response';
import { GetEventResponse } from './dto/response/get-event.response';
import { ConditionType } from './condition.type';

describe('EventController', () => {
  let controller: EventController;
  let service: Partial<Record<keyof EventService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      getFilterEvents: jest.fn(),
      getEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: service }],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call eventService.register and return response', async () => {
      const dto: EventRegisterRequest = {
        name: 'Test Event',
        description: 'Desc',
        conditionType: ConditionType.CONSECUTIVE_LOGIN,
        startAt: new Date(),
        endAt: new Date(),
      };
      const result: EventRegisterResponse = {
        id: '1',
        status: 'CREATED',
        name: '',
        message: '',
      };
      (service.register as jest.Mock).mockResolvedValue(result);

      const res = await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(res).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should call eventService.getFilterEvents and return list', async () => {
      const filter: EventFilterRequest = {
        name: '로그인',
        conditionType: ConditionType.CONSECUTIVE_LOGIN,
      };
      const result: GetAllEventResponse = {
        events: [],
        status: '',
        message: '',
      };
      (service.getFilterEvents as jest.Mock).mockResolvedValue(result);

      const res = await controller.findAll(filter);
      expect(service.getFilterEvents).toHaveBeenCalledWith(filter);
      expect(res).toEqual(result);
    });
  });

  describe('getEvent', () => {
    it('should call eventService.getEvent and return event detail', async () => {
      const id = '123';
      const result: GetEventResponse = {
        event: {
          id: '123',
          name: 'Test Event',
          description: 'Desc',
          conditionType: ConditionType.CONSECUTIVE_LOGIN,
          conditionParams: { count: 5 },
          startAt: new Date('2025-06-01T00:00:00Z'),
          endAt: new Date('2025-06-30T23:59:59Z'),
          isActive: true,
        },
      } as any;
      (service.getEvent as jest.Mock).mockResolvedValue(result);

      const res = await controller.getEvent(id);
      expect(service.getEvent).toHaveBeenCalledWith(id);
      expect(res).toEqual(result);
    });
  });
});
