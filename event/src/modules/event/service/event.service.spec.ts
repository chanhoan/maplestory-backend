import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from '../repository/event.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventRegisterRequest } from '../dto/request/event.register.request';
import { ConditionType } from '../../../common/type/condition.type';
import { GetAllEventResponse } from '../dto/response/get-all-event.response';
import { GetEventResponse } from '../dto/response/get-event.response';
import { EventResponse } from '../dto/response/event.response';

describe('EventService', () => {
  let service: EventService;
  let repo: jest.Mocked<EventRepository>;

  beforeEach(async () => {
    repo = {
      findConflict: jest.fn(),
      create: jest.fn(),
      findByFilters: jest.fn(),
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService, { provide: EventRepository, useValue: repo }],
    }).compile();

    service = module.get<EventService>(EventService);
    // Assign mock repository manually to ensure it's injected correctly
    (service as any).eventRepository = repo;
  });

  describe('register', () => {
    const dto: EventRegisterRequest = {
      name: 'Test',
      description: 'Desc',
      conditionType: ConditionType.CONSECUTIVE_LOGIN,
      days: 3,
      startAt: new Date('2025-06-01T00:00:00Z'),
      endAt: new Date('2025-06-10T00:00:00Z'),
      isActive: true,
    } as any;

    it('throws ConflictException if overlapping event exists', async () => {
      repo.findConflict.mockResolvedValue({} as any);
      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('creates and returns success response', async () => {
      repo.findConflict.mockResolvedValue(null);
      const created = { id: '1', name: dto.name } as any;
      repo.create.mockResolvedValue(created);

      const res = await service.register(dto);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          description: dto.description,
          conditionType: dto.conditionType,
          conditionParams: { days: dto.days },
          startAt: dto.startAt,
          endAt: dto.endAt,
          isActive: dto.isActive,
        }),
      );
      expect(res).toEqual({
        status: 'SUCCESS',
        message: '이벤트 생성 성공',
        id: created.id,
        name: created.name,
      });
    });
  });

  describe('getFilterEvents', () => {
    it('returns mapped list of events', async () => {
      const docs = [
        {
          id: '1',
          name: 'A',
          description: 'D',
          conditionType: ConditionType.CONSECUTIVE_LOGIN,
          conditionParams: { days: 2 },
          startAt: new Date(),
          endAt: new Date(),
          isActive: false,
        } as any,
      ];
      repo.findByFilters.mockResolvedValue(docs);

      const res: GetAllEventResponse = await service.getFilterEvents({} as any);
      expect(repo.findByFilters).toHaveBeenCalledWith(expect.any(Object));
      expect(res.events).toHaveLength(1);
      const evt: EventResponse = res.events[0];
      expect(evt).toMatchObject({ id: '1', name: 'A', description: 'D' });
      expect(res.status).toBe('SUCCESS');
    });
  });

  describe('getEvent', () => {
    it('throws NotFoundException if not found', async () => {
      repo.findById.mockResolvedValue(null as any);
      await expect(service.getEvent('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns event detail when found', async () => {
      const doc = {
        id: '2',
        name: 'B',
        description: 'Desc',
        conditionType: ConditionType.CONSECUTIVE_LOGIN,
        conditionParams: { days: 5 },
        startAt: new Date('2025-07-01'),
        endAt: new Date('2025-07-05'),
        isActive: true,
      } as any;
      repo.findById.mockResolvedValue(doc);

      const res: GetEventResponse = await service.getEvent('2');
      expect(repo.findById).toHaveBeenCalledWith('2');
      expect(res.event).toMatchObject({
        id: '2',
        name: 'B',
        description: 'Desc',
        isActive: true,
      });
      expect(res.status).toBe('SUCCESS');
    });
  });
});
