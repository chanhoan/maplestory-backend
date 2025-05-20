import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { RegisterRequest } from '../dto/request/register.request';
import { LoginRequest } from '../dto/request/login.request';
import { UpdateInfoRequest } from '../dto/request/update.info.request';
import { AssignRoleRequest } from '../dto/request/assign.role.request';
import { DuplicateResponse } from '../dto/response/dupblicate.response';
import { RegisterResponse } from '../dto/response/register.response';
import { LoginResponse } from '../dto/response/login.response';
import { BasicResponse } from '../../../common/responses/basic.response';
import { GetProfileResponse } from '../dto/response/get.profile.response';
import { AllUserResponse } from '../dto/response/all.user.response';
import { UserRole } from '../../../common/enums/user.role';

describe('AuthController', () => {
  let controller: AuthController;
  let service: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      isDuplicate: jest.fn().mockResolvedValue({} as DuplicateResponse),
      register: jest.fn().mockResolvedValue({} as RegisterResponse),
      login: jest.fn().mockResolvedValue({} as LoginResponse),
      logout: jest.fn().mockResolvedValue({} as BasicResponse),
      refresh: jest.fn().mockResolvedValue({} as LoginResponse),
      getInfo: jest.fn().mockResolvedValue({} as GetProfileResponse),
      updateInfo: jest.fn().mockResolvedValue({} as BasicResponse),
      delete: jest.fn().mockResolvedValue({} as BasicResponse),
      getAllUsers: jest.fn().mockResolvedValue({} as AllUserResponse),
      assignRole: jest.fn().mockResolvedValue({} as BasicResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('duplicateCheck', () => {
    it('should call service.isDuplicate and return result', async () => {
      const username = 'testuser';
      const result: DuplicateResponse = {
        status: 'OK',
        message: 'dup',
        isDuplicate: false,
      };
      (service.isDuplicate as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.duplicateCheck(username)).toEqual(result);
      expect(service.isDuplicate).toHaveBeenCalledWith(username);
    });
  });

  describe('register', () => {
    it('should call service.register and return result', async () => {
      const dto: RegisterRequest = {
        username: 'u',
        password: 'p',
        email: 'e',
        nickname: 'n',
        phone: '1234',
      };
      const result: RegisterResponse = {
        status: 'SUCCESS',
        message: 'ok',
        username: 'u',
        email: 'e',
      };
      (service.register as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.register(dto)).toEqual(result);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call service.login and return result', async () => {
      const dto: LoginRequest = { username: 'u', password: 'p' };
      const result: LoginResponse = {
        status: 'SUCCESS',
        message: 'ok',
        username: 'u',
        accessToken: 'token',
      };
      (service.login as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.login(dto)).toEqual(result);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should call service.logout and return basic response', async () => {
      const req: any = { header: () => 'user' };
      const result: BasicResponse = { status: 'SUCCESS', message: 'out' };
      (service.logout as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.logout(req)).toEqual(result);
      expect(service.logout).toHaveBeenCalledWith(req);
    });
  });

  describe('refresh', () => {
    it('should call service.refresh and return new token', async () => {
      const req: any = { header: () => 'user' };
      const result: LoginResponse = {
        status: 'SUCCESS',
        message: 'refreshed',
        username: 'u',
        accessToken: 'newtoken',
      };
      (service.refresh as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.refresh(req)).toEqual(result);
      expect(service.refresh).toHaveBeenCalledWith(req);
    });
  });

  describe('getInfo', () => {
    it('should call service.getInfo and return profile', async () => {
      const req: any = { header: () => 'user' };
      const result: GetProfileResponse = {
        status: 'SUCCESS',
        message: 'info',
        username: 'u',
        email: 'e',
        profile: { nickname: 'n', phone: 'p' },
      };
      (service.getInfo as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.getInfo(req)).toEqual(result);
      expect(service.getInfo).toHaveBeenCalledWith(req);
    });
  });

  describe('updateMyProfile', () => {
    it('should call service.updateInfo and return basic response', async () => {
      const req: any = { header: () => 'user' };
      const dto: UpdateInfoRequest = { email: 'e', nickname: 'n', phone: 'p' };
      const result: BasicResponse = { status: 'SUCCESS', message: 'updated' };
      (service.updateInfo as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.updateMyProfile(req, dto)).toEqual(result);
      expect(service.updateInfo).toHaveBeenCalledWith(req, dto);
    });
  });

  describe('delete', () => {
    it('should call service.delete and return basic response', async () => {
      const req: any = { header: () => 'user' };
      const result: BasicResponse = { status: 'SUCCESS', message: 'deleted' };
      (service.delete as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.delete(req)).toEqual(result);
      expect(service.delete).toHaveBeenCalledWith(req);
    });
  });

  describe('getALlUsers', () => {
    it('should call service.getAllUsers and return list', async () => {
      const result: AllUserResponse = {
        status: 'SUCCESS',
        message: 'all',
        users: [],
      };
      (service.getAllUsers as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.getALlUsers()).toEqual(result);
      expect(service.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('assignRole', () => {
    it('should call service.assignRole and return basic response', async () => {
      const req: any = { header: () => 'user' };
      const dto: AssignRoleRequest = { userId: 'id', role: UserRole.ADMIN };
      const result: BasicResponse = {
        status: 'SUCCESS',
        message: 'role assigned',
      };
      (service.assignRole as jest.Mock).mockResolvedValueOnce(result);
      expect(await controller.assignRole(req, dto)).toEqual(result);
      expect(service.assignRole).toHaveBeenCalledWith(req, dto);
    });
  });
});
