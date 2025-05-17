import {
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

import { UserRepository } from '../user/user.repository';
import { UserRole } from '../user/user.role';

import { RegisterRequest } from './dto/request/register.request';
import { LoginRequest } from './dto/request/login.request';
import { DuplicateResponse } from './dto/response/dupblicate.response';
import { RegisterResponse } from './dto/response/register.response';
import { LoginResponse } from './dto/response/login.response';
import { BasicResponse } from './dto/response/basic.response';
import { GetProfileResponse } from './dto/response/get.profile.response';
import { Request } from 'express';
import { JwtUser } from './dto/user.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
  ) {}

  async isDuplicate(username: string): Promise<DuplicateResponse> {
    const existUser = await this.userRepository.findById(username);
    return {
      status: 'OK',
      message: '중복검사 조회 성공',
      isDuplicate: existUser !== null,
    };
  }

  async register(dto: RegisterRequest): Promise<RegisterResponse> {
    const hash = await bcrypt.hash(dto.password, 10);

    const profile = {
      nickname: dto.nickname,
      phone: dto.phone,
    };

    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash: hash,
      role: UserRole.USER,
      profile: profile,
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
      throw new UnauthorizedException('Invalid credentials');
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

  async getProfile(req: Request): Promise<GetProfileResponse> {
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

  /** ADMIN 전용: 특정 사용자에 역할 부여 */
  async assignRole(adminId: string, targetusername: string, role: UserRole) {
    // 본인 권한 검증은 컨트롤러의 @Roles('ADMIN') 가 처리하지만, 여기서 추가 검사할 수도 있습니다.
    return this.userRepository.updateRole(targetusername, role);
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
