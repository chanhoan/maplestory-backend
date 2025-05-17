import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { ClientKafka } from '@nestjs/microservices';

import { UserRepository } from '../user/user.repository';
import { UserRole } from '../user/user.role';
import { UserDocument } from '../user/user.shema';

import { RegisterRequest } from './dto/request/register.request';
import { LoginRequest } from './dto/request/login.request';
import { UpdateInfoRequest } from './dto/request/update.info.request';

import { DuplicateResponse } from './dto/response/dupblicate.response';
import { RegisterResponse } from './dto/response/register.response';
import { LoginResponse } from './dto/response/login.response';
import { BasicResponse } from './dto/response/basic.response';
import { GetProfileResponse } from './dto/response/get.profile.response';
import { Request } from 'express';
import { JwtUser } from './dto/user.decorator';
import { AssignRoleRequest } from './dto/request/assign.role.request';
import { AllUserResponse, UserDto } from './dto/response/all.user.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async isDuplicate(username: string): Promise<DuplicateResponse> {
    const existUser = await this.userRepository.findByUsername(username);
    return {
      status: 'OK',
      message: '중복검사 조회 성공',
      isDuplicate: existUser !== null,
    };
  }

  async register(dto: RegisterRequest): Promise<RegisterResponse> {
    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      throw new HttpException(
        '이미 존재하는 사용자입니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const profile = {
      nickname: dto.nickname,
      phone: dto.phone,
    };

    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      role: UserRole.USER,
      profile,
    });

    return {
      status: 'SUCCESS',
      message: '회원가입이 완료되었습니다.',
      username: user.username,
      email: user.email,
    };
  }

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 틀렸습니다.');
    }

    const payload = {
      username: user.username.toString(),
      role: user.role,
      jti: randomUUID(),
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload);

    const refreshExpiresIn = this.configService.get<number>('redis.ttl');

    await this.cache.set(
      `refresh_${user.username}`,
      refreshToken,
      refreshExpiresIn,
    );
    await this.cache.set(`blacklist_${payload.jti}`, false, 3600);

    return {
      status: 'SUCCESS',
      message: '로그인에 성공하였습니다.',
      username: user.username,
      accessToken: accessToken,
    };
  }

  async logout(req: Request): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwared-user'));

    await this.cache.del(`refresh_${user.username}`);

    const nowSec = Math.floor(Date.now() / 1000);
    const ttl = user.expiresIn - nowSec;
    await this.cache.set(`blacklist_${user.jti}`, true, ttl);

    return {
      status: 'SUCCESS',
      message: '로그아웃에 성공하였습니다.',
    };
  }

  async refresh(req: Request): Promise<LoginResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));

    const stored = await this.cache.get<string>(`refresh_${user.username}`);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: user.username,
      role: user.role,
      jti: randomUUID(),
    };

    const newAccessToken = this.jwtService.sign(payload);
    return {
      status: 'SUCCESS',
      message: 'refresh token 재발급에 성공하였습니다.',
      username: user.username,
      accessToken: newAccessToken,
    };
  }

  async getInfo(req: Request): Promise<GetProfileResponse> {
    const user = this.getUser(req.header('x-forwared-user'));

    const existUser = await this.userRepository.findByUsername(user?.username);

    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'SUCCESS',
      message: '유저 정보 조회 성공',
      username: existUser.username,
      email: existUser.email,
      profile: existUser.profile,
    };
  }

  async updateInfo(
    req: Request,
    dto: UpdateInfoRequest,
  ): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwared-user'));

    const existUser = await this.userRepository.findByUsername(user?.username);

    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: Partial<UserDocument> = {
      email: dto.email ?? existUser.email,
      profile: {
        ...existUser.profile,
        nickname: dto.nickname ?? existUser.profile.nickname,
        phone: dto.phone ?? existUser.profile.phone,
      },
    };

    const updated = await this.userRepository.findByUsernameAndUpdate(
      existUser.username,
      updateData,
    );
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'SUCCESS',
      message: '유저 정보 업데이트 성공',
    };
  }

  async delete(req: Request): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    if (!user?.username) {
      throw new NotFoundException('유효한 사용자 정보가 없습니다.');
    }

    await this.userRepository.softDelete(user.username);

    this.kafkaClient.emit('user.deletion.requested', {
      username: user.username,
    });

    return {
      status: 'SUCCESS',
      message: '유저 삭제 요청이 접수되었습니다.',
    };
  }

  async getAllUsers(req: Request): Promise<AllUserResponse> {
    const userDocs = await this.userRepository.findAll();
    if (!userDocs) {
      throw new NotFoundException('조회할 유저가 없습니다.');
    }

    const users: UserDto[] = userDocs.map((doc) => ({
      username: doc.username,
      email: doc.email,
      role: doc.role,
      profile: doc.profile,
    }));

    return {
      status: 'SUCCESS',
      message: '모든 유저 조회 성공',
      users: users,
    };
  }

  async assignRole(
    req: Request,
    dto: AssignRoleRequest,
  ): Promise<BasicResponse> {
    await this.userRepository.updateRole(dto.username, dto.role);

    return {
      status: 'SUCCESS',
      message: '유저 권한 부여 성공',
    };
  }

  private getUser(raw: string | undefined): JwtUser {
    if (!raw) {
      throw new UnauthorizedException('인증 정보가 없습니다.');
    }

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      throw new UnauthorizedException('잘못된 인증 정보 포맷입니다.');
    }
  }
}
