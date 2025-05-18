import { Injectable, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { RewardRequestRepository } from './reward-request.repository';
import { EventProgressRepository } from '../event-progress/event-progress.repository';
import { JwtUser } from '../common/dto/user.decorator';
import { Request } from 'express';
import { RewardRequestRegisterResponse } from './dto/response/reward-request.register.response';
import { GetAllRewardRequestResponse } from './dto/response/get-all-reward-request-response';
import { GetRewardRequestResponse } from './dto/response/get-reward-request.response';
import { RewardRequestFilterRequest } from './dto/request/reward-request.filter.request';
import { RewardRequestResponse } from './dto/response/reward-request.response';
import { RewardRequestStatus, RewardRequestDocument } from './reward-request.schema';
import { UserRole } from '../common/dto/user.role';

/**
 * 보상 요청(RewardRequest) 관련 비즈니스 로직을 처리하는 서비스입니다.
 * - 보상 요청 등록
 * - 본인 또는 관리자에 의한 보상 요청 조회
 */
@Injectable()
export class RewardRequestService {
  constructor(
    private readonly rewardRequestRepository: RewardRequestRepository,
    private readonly eventProgressRepository: EventProgressRepository,
  ) {}

  /**
   * 새로운 보상 요청을 생성합니다.
   * - 이미 요청이 존재하면 ConflictException을 던집니다.
   * - 진행 조건이 충족된 경우 즉시 APPROVED 상태로 설정합니다.
   *
   * @param eventId - 요청할 이벤트 ID
   * @param req - Express Request (헤더의 JWT 페이로드 사용)
   * @throws ConflictException 이미 존재하는 요청인 경우
   * @returns 생성된 보상 요청 ID 및 이벤트 ID
   */
  async register(
    eventId: string,
    req: Request,
  ): Promise<RewardRequestRegisterResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));

    const exist = await this.rewardRequestRepository.findByUserAndEvent({
      userId: user.userId,
      eventId,
    });
    if (exist) {
      throw new ConflictException('이미 존재하는 보상 요청입니다.');
    }

    const progress = await this.eventProgressRepository.findByUserAndEvent({
      userId: user.userId,
      eventId,
    });

    const status = progress?.eligible
      ? RewardRequestStatus.APPROVED
      : RewardRequestStatus.PENDING;

    const rewardRequest = await this.rewardRequestRepository.create({
      userId: user.userId,
      eventId,
      status,
    });

    return {
      status: 'SUCCESS',
      message: '보상 요청 등록 성공',
      id: rewardRequest.id,
      eventId,
    };
  }

  /**
   * 본인 또는 관리자가 보상 요청 목록을 조회합니다.
   * - USER 권한은 본인 요청만, ADMIN 이상은 전체 요청 조회 가능
   *
   * @param req - Express Request (헤더의 JWT 페이로드 사용)
   * @param filter - 조회 필터 DTO (userId, eventId, status)
   * @returns 필터링된 보상 요청 리스트
   */
  async getAllRequests(
    req: Request,
    filter: RewardRequestFilterRequest,
  ): Promise<GetAllRewardRequestResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    const query: Partial<RewardRequestFilterRequest> = {
      eventId: filter.eventId,
      status: filter.status,
    };

    if (user.role === UserRole.USER) {
      query.userId = user.userId;
    } else if (filter.userId) {
      query.userId = filter.userId;
    }

    const items = await this.rewardRequestRepository.findByFilters(query);
    const rewardRequests: RewardRequestResponse[] = items.map((rr) => ({
      id: rr.id,
      userId: rr.userId,
      eventId: rr.eventId,
      status: rr.status,
      requestedAt: rr.requestedAt,
      processedAt: rr.processedAt,
      operatorId: rr.operatorId,
      reason: rr.reason,
    }));

    return {
      status: 'SUCCESS',
      message: '보상 요청 조회 성공',
      rewardRequests,
    };
  }

  /**
   * 단일 보상 요청의 상세 정보를 조회합니다.
   * - USER 권한은 본인 요청만, ADMIN 이상은 전체 조회 가능
   *
   * @param req - Express Request (헤더의 JWT 페이로드 사용)
   * @param id - 조회할 보상 요청 ID
   * @throws NotFoundException 요청이 존재하지 않을 경우
   * @throws ForbiddenException 본인 요청이 아닐 경우
   * @returns 단일 보상 요청 상세 정보
   */
  async getRequest(
    req: Request,
    id: string,
  ): Promise<GetRewardRequestResponse> {
    const user = this.getUser(req.header('x-forwarded-user'));
    const exist = await this.rewardRequestRepository.findById(id);
    if (!exist) {
      throw new NotFoundException('보상 요청이 없습니다.');
    }
    if (
      user.role === UserRole.USER &&
      exist.userId.toString() !== user.userId
    ) {
      throw new ForbiddenException('본인의 요청만 조회할 수 있습니다.');
    }

    const rr: RewardRequestDocument = exist;
    const payload: RewardRequestResponse = {
      id: rr.id,
      userId: rr.userId,
      eventId: rr.eventId,
      status: rr.status,
      requestedAt: rr.requestedAt,
      processedAt: rr.processedAt,
      operatorId: rr.operatorId,
      reason: rr.reason,
    };

    return {
      status: 'SUCCESS',
      message: '보상 요청 조회 성공',
      rewardRequest: payload,
    };
  }

  /**
   * HTTP 헤더의 JWT 페이로드를 파싱하여 반환합니다.
   *
   * @param raw - 'x-forwarded-user' 헤더 값
   * @throws UnauthorizedException 인증 정보 없거나 포맷 오류 시
   * @returns 디코딩된 JwtUser 객체
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
