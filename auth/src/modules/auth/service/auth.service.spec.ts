import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from '../repository/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../common/enums/user.role';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let cache: { set: jest.Mock; get: jest.Mock; del: jest.Mock };
  let kafkaClient: jest.Mocked<ClientKafka>;

  beforeEach(async () => {
    userRepo = {
      findByUsername: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findAll: jest.fn(),
      updateRole: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signedToken'),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn().mockReturnValue(3600),
    } as unknown as jest.Mocked<ConfigService>;

    cache = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    kafkaClient = {
      emit: jest
        .fn()
        .mockReturnValue({ subscribe: jest.fn(({ complete }) => complete()) }),
    } as unknown as jest.Mocked<ClientKafka>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: 'CACHE_MANAGER', useValue: cache },
        { provide: 'KAFKA_SERVICE', useValue: kafkaClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('isDuplicate', () => {
    it('returns true if user exists', async () => {
      userRepo.findByUsername.mockResolvedValue({} as any);
      const res = await service.isDuplicate('u');
      expect(res.isDuplicate).toBe(true);
    });

    it('returns false if not exists', async () => {
      userRepo.findByUsername.mockResolvedValue(null);
      const res = await service.isDuplicate('u');
      expect(res.isDuplicate).toBe(false);
    });
  });

  describe('register', () => {
    const dto = {
      username: 'u',
      password: 'p',
      email: 'e',
      nickname: 'n',
      phone: 't',
    };

    it('throws conflict if existing', async () => {
      userRepo.findByUsername.mockResolvedValue({} as any);
      await expect(service.register(dto as any)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('creates new user', async () => {
      userRepo.findByUsername.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash');
      userRepo.create.mockResolvedValue({
        username: dto.username,
        email: dto.email,
      } as any);
      const res = await service.register(dto as any);
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.username,
          passwordHash: 'hash',
        }),
      );
      expect(res.username).toBe(dto.username);
    });
  });

  describe('login', () => {
    const dto = { username: 'u', password: 'p' };

    it('throws unauthorized if not found', async () => {
      userRepo.findByUsername.mockResolvedValue(null);
      await expect(service.login(dto as any)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws unauthorized if password mismatch', async () => {
      userRepo.findByUsername.mockResolvedValue({ passwordHash: 'h' } as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(service.login(dto as any)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns tokens on success', async () => {
      userRepo.findByUsername.mockResolvedValue({
        id: 'id',
        username: 'u',
        passwordHash: 'h',
        role: 'USER',
      } as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const res = await service.login(dto as any);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(
        expect.stringContaining('refresh_u'),
        expect.any(String),
        expect.any(Number),
      );
      expect(res.accessToken).toBe('signedToken');
    });
  });

  describe('refresh', () => {
    it('throws unauthorized if no refresh in cache', async () => {
      cache.get.mockResolvedValue(null);
      const req: any = {
        header: () => encodeURIComponent(JSON.stringify({ username: 'u' })),
      };
      await expect(service.refresh(req)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns new access token', async () => {
      cache.get.mockResolvedValue('token');
      const req: any = {
        header: () =>
          encodeURIComponent(JSON.stringify({ username: 'u', role: 'USER' })),
      };
      const res = await service.refresh(req);
      expect(res.accessToken).toBe('signedToken');
    });
  });

  describe('getInfo', () => {
    it('throws not found if user missing', async () => {
      const req: any = {
        header: () => encodeURIComponent(JSON.stringify({ userId: 'x' })),
      };
      userRepo.findById.mockResolvedValue(null);
      await expect(service.getInfo(req)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns profile', async () => {
      const req: any = {
        header: () => encodeURIComponent(JSON.stringify({ userId: 'x' })),
      };
      userRepo.findById.mockResolvedValue({
        username: 'u',
        email: 'e',
        profile: { nickname: 'n', phone: 'p' },
      } as any);
      const res = await service.getInfo(req);
      expect(res.username).toBe('u');
    });
  });

  describe('assignRole', () => {
    it('throws not found if updateRole returns null', async () => {
      userRepo.updateRole.mockResolvedValue(null);
      await expect(
        service.assignRole({} as any, { userId: 'x', role: UserRole.ADMIN }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('succeeds', async () => {
      userRepo.updateRole.mockResolvedValue({} as any);
      const res = await service.assignRole({} as any, {
        userId: 'x',
        role: UserRole.ADMIN,
      });
      expect(res.status).toBe('SUCCESS');
    });
  });

  describe('getAllUsers', () => {
    it('returns empty users array when repository returns empty list', async () => {
      userRepo.findAll.mockResolvedValue([] as any);
      const res = await service.getAllUsers();
      expect(res.status).toBe('SUCCESS');
      expect(res.users).toEqual([]);
    });

    it('returns list when repository returns users', async () => {
      const mockUsers = [
        {
          id: 'x',
          username: 'u',
          email: 'e',
          role: 'USER',
          profile: {},
        } as any,
      ];
      userRepo.findAll.mockResolvedValue(mockUsers);
      const res = await service.getAllUsers();
      expect(res.users).toHaveLength(mockUsers.length);
      expect(res.users[0].username).toBe('u');
    });
  });

  it('returns list', async () => {
    userRepo.findAll.mockResolvedValue([
      { id: 'x', username: 'u', email: 'e', role: 'USER', profile: {} } as any,
    ]);
    const res = await service.getAllUsers();
    expect(res.users).toHaveLength(1);
  });
});
