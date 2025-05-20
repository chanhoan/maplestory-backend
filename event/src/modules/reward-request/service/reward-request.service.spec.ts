import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestRepository } from '../repository/reward-request.repository';
import { EventProgressRepository } from '../../event-progress/repository/event-progress.repository';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RewardRequestStatus } from '../schema/reward-request.schema';

// Mock header parsing
const makeReq = (user: any) =>
  ({ header: () => encodeURIComponent(JSON.stringify(user)) }) as any;

describe('RewardRequestService', () => {
  let service: RewardRequestService;
  let repo: jest.Mocked<RewardRequestRepository>;
  let progressRepo: jest.Mocked<EventProgressRepository>;

  beforeEach(async () => {
    repo = {
      findByUserAndEvent: jest.fn(),
      create: jest.fn(),
      findByFilters: jest.fn(),
      findById: jest.fn(),
    } as any;
    progressRepo = { findByUserAndEvent: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestService,
        { provide: RewardRequestRepository, useValue: repo },
        { provide: EventProgressRepository, useValue: progressRepo },
      ],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
    (service as any).rewardRequestRepository = repo;
    (service as any).eventProgressRepository = progressRepo;
  });

  describe('register', () => {
    const user = { userId: 'u1' };
    const req = makeReq(user);
    const eventId = 'e1';

    it('throws UnauthorizedException when no header', async () => {
      await expect(
        service.register(eventId, { header: () => undefined } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws ConflictException when exist is falsy', async () => {
      repo.findByUserAndEvent.mockReturnValue(null as any);
      await expect(service.register(eventId, req)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('creates with PENDING if no progress eligible', async () => {
      repo.findByUserAndEvent.mockReturnValue({} as any);
      progressRepo.findByUserAndEvent.mockResolvedValue({
        eligible: false,
      } as any);
      const created = { id: 'r1' } as any;
      repo.create.mockResolvedValue(created);

      const res = await service.register(eventId, req);
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'u1',
        eventId,
        status: RewardRequestStatus.PENDING,
      });
      expect(res.id).toBe('r1');
    });

    it('creates with APPROVED if progress eligible', async () => {
      repo.findByUserAndEvent.mockReturnValue({} as any);
      progressRepo.findByUserAndEvent.mockResolvedValue({
        eligible: true,
      } as any);
      const created = { id: 'r2' } as any;
      repo.create.mockResolvedValue(created);

      const res = await service.register(eventId, req);
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'u1',
        eventId,
        status: RewardRequestStatus.APPROVED,
      });
      expect(res.id).toBe('r2');
    });
  });

  describe('getAllRequests', () => {
    const user = { userId: 'u1', role: 'USER' };
    const admin = { userId: 'admin', role: 'ADMIN' };
    const reqUser = makeReq(user);
    const reqAdmin = makeReq(admin);
    const filter = {
      eventId: 'e1',
      status: RewardRequestStatus.PENDING,
    } as any;

    it('filters by userId when USER role', async () => {
      progressRepo.findByUserAndEvent.mockReturnValue(null as any);
      repo.findByFilters.mockResolvedValue([] as any);

      const res = await service.getAllRequests(reqUser, filter);
      expect(repo.findByFilters).toHaveBeenCalledWith({
        deleteAt: { $exists: false },
        eventId: 'e1',
        status: 'PENDING',
        userId: 'u1',
      });
      expect(res.rewardRequests).toEqual([]);
    });

    it('accepts filter.userId for admin', async () => {
      repo.findByFilters.mockResolvedValue([] as any);
      await service.getAllRequests(reqAdmin, {
        ...filter,
        userId: 'u2',
      } as any);
      expect(repo.findByFilters).toHaveBeenCalledWith({
        deleteAt: { $exists: false },
        eventId: 'e1',
        status: 'PENDING',
        userId: 'u2',
      });
    });
  });

  describe('getRequest', () => {
    const user = { userId: 'u1', role: 'USER' };
    const req = makeReq(user);
    const otherReq = makeReq({ userId: 'u2', role: 'USER' });
    const id = 'req1';

    it('throws NotFoundException if not exist', async () => {
      repo.findById.mockResolvedValue(null as any);
      await expect(service.getRequest(req, id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if USER requests another users', async () => {
      repo.findById.mockResolvedValue({ userId: 'u1' } as any);
      await expect(service.getRequest(otherReq, id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns data when allowed', async () => {
      const doc = {
        id,
        userId: 'u1',
        eventId: 'e1',
        status: RewardRequestStatus.PENDING,
      } as any;
      repo.findById.mockResolvedValue(doc);

      const res = await service.getRequest(req, id);
      expect(res.rewardRequest.id).toBe(id);
      expect(res.status).toBe('SUCCESS');
    });
  });
});
