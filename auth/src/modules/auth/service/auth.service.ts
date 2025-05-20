import {
  ConflictException,
  ConsoleLogger,
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

import { AuthRepository } from '../repository/auth.repository';
import { UserRole } from '../../../common/enums/user.role';
import { UserDocument } from '../schema/user.shema';

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
import { UserDto } from '../dto/response/user.dto';

import { Request } from 'express';
import { JwtUser } from '../../../common/decorators/user.decorator';

/**
 * 인증(Authentication) 관련 비즈니스 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class AuthService {
  private readonly logger = new ConsoleLogger('Auth');

  constructor(
    private readonly userRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * 주어진 사용자명으로 중복 여부를 확인합니다.
   *
   * @param username - 검사할 사용자명
   * @returns 중복 여부를 담은 객체
   */
  async isDuplicate(username: string): Promise<DuplicateResponse> {
    const existUser = await this.userRepository.findByUsername(username);
    return {
      status: 'OK',
      message: '중복검사 조회 성공',
      isDuplicate: existUser !== null,
    };
  }

  /**
   * 새로운 사용자를 등록하고, 등록 결과를 반환합니다.
   *
   * @param dto - 회원가입 정보 DTO
   * @throws ConflictException 이미 존재하는 사용자일 경우
   * @returns 생성된 사용자 정보
   */
  async register(dto: RegisterRequest): Promise<RegisterResponse> {
    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('이미 존재하는 유저입니다.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const profile = { nickname: dto.nickname, phone: dto.phone };
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

  /**
   * 사용자 로그인 처리 후 액세스 토큰 및 리프레시 토큰을 발급합니다.
   *
   * @param dto - 로그인 정보 DTO
   * @throws UnauthorizedException 인증 실패 시
   * @returns 발급된 토큰 정보
   */
  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 틀렸습니다.');
    }

    const payload = {
      sub: user.id,
      username: user.username.toString(),
      role: user.role,
      expiresIn: '1h',
      jti: randomUUID(),
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);
    const refreshExpiresIn = this.configService.get<number>('redis.ttl');

    await this.cache.set(
      `refresh_${user.username}`,
      refreshToken,
      refreshExpiresIn,
    );
    await this.cache.set(`blacklist_${payload.jti}`, false, 3600);

    this.kafkaClient.emit('user.login', { userId: user.id }).subscribe({
      complete: () => this.logger.log('Emit completed'),
      error: (err) => this.logger.error('Emit failed', err),
    });

    return {
      status: 'SUCCESS',
      message: '로그인에 성공하였습니다.',
      username: user.username,
      accessToken,
    };
  }

  /**
   * 로그아웃 처리 후 리프레시 토큰을 삭제하고 액세스 토큰을 블랙리스트에 등록합니다.
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @returns 기본 응답
   */
  async logout(req: Request): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    await this.cache.del(`refresh_${user.username}`);

    const nowSec = Math.floor(Date.now() / 1000);
    const ttl = user.expiresIn - nowSec;
    await this.cache.set(`blacklist_${user.jti}`, true, ttl);

    return {
      status: 'SUCCESS',
      message: '로그아웃에 성공하였습니다.',
    };
  }

  /**
   * 리프레시 토큰을 검증하고 새로운 액세스 토큰을 발급합니다.
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @throws UnauthorizedException 토큰 검증 실패 시
   * @returns 새로 발급된 토큰 정보
   */
  async refresh(req: Request): Promise<LoginResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    const stored = await this.cache.get<string>(`refresh_${user.username}`);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      username: user.username,
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

  /**
   * 현재 로그인된 사용자의 프로필 정보를 조회합니다.
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   * @returns 사용자 프로필 정보
   */
  async getInfo(req: Request): Promise<GetProfileResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    const existUser = await this.userRepository.findById(user.userId);
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

  /**
   * 현재 로그인된 사용자의 프로필 정보를 업데이트합니다.
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @param dto - 업데이트할 정보 DTO
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   * @returns 기본 응답
   */
  async updateInfo(
    req: Request,
    dto: UpdateInfoRequest,
  ): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    const existUser = await this.userRepository.findById(user.userId);
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

    const updated = await this.userRepository.findByIdAndUpdate(
      existUser.id,
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

  /**
   * 사용자 삭제 요청을 발행합니다. (SAGA 시작)
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @returns 기본 응답
   */
  async delete(req: Request): Promise<BasicResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    if (!user.userId) {
      throw new NotFoundException('유효한 사용자 정보가 없습니다.');
    }

    await this.logout(req);

    this.kafkaClient.emit('user.deletion.requested', { userId: user.userId });
    return {
      status: 'SUCCESS',
      message: '유저 삭제 요청이 접수되었습니다.',
    };
  }

  /**
   * 모든 사용자 목록을 조회하여 반환합니다.
   *
   * @returns 전체 사용자 정보 리스트
   */
  async getAllUsers(): Promise<AllUserResponse> {
    const userDocs = await this.userRepository.findAll();
    if (!userDocs) {
      throw new NotFoundException('조회할 유저가 없습니다.');
    }

    const users: UserDto[] = userDocs.map((doc) => ({
      id: doc.id,
      username: doc.username,
      email: doc.email,
      role: doc.role,
      profile: doc.profile,
    }));

    return {
      status: 'SUCCESS',
      message: '모든 유저 조회 성공',
      users,
    };
  }

  /**
   * 특정 사용자에게 역할을 할당합니다.
   *
   * @param req - Express 요청 객체 (헤더의 인증 정보를 사용)
   * @param dto - 역할 할당 정보 DTO
   * @throws NotFoundException 대상 사용자가 없을 경우
   * @returns 기본 응답
   */
  async assignRole(
    req: Request,
    dto: AssignRoleRequest,
  ): Promise<BasicResponse> {
    const user = await this.userRepository.updateRole(dto.userId, dto.role);
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }
    return {
      status: 'SUCCESS',
      message: '유저 권한 부여 성공',
    };
  }

  /**
   * 헤더로부터 JWT 페이로드를 파싱하여 반환합니다.
   *
   * @param raw - HTTP 헤더에 담긴 인코딩된 JWT 페이로드 문자열
   * @throws UnauthorizedException 인증 정보가 없거나 잘못된 포맷일 경우
   * @returns 파싱된 JWT 페이로드 객체
   */
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
