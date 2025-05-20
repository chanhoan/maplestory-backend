import { EventRepository } from '../repository/event.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventRegisterRequest } from '../dto/request/event.register.request';
import { EventRegisterResponse } from '../dto/response/event.register.response';
import { ConditionType } from '../../../common/type/condition.type';
import { GetAllEventResponse } from '../dto/response/get-all-event.response';
import { GetEventResponse } from '../dto/response/get-event.response';
import { EventResponse } from '../dto/response/event.response';
import { EventFilterRequest } from '../dto/request/event.filter.request';
import { EventDocument } from '../schema/event.schema';
import { FilterQuery } from 'mongoose';

/**
 * 이벤트 도메인의 비즈니스 로직을 담당하는 서비스입니다.
 * - 이벤트 생성 시 기간 중복 검사
 * - 필터링된 이벤트 조회
 * - 단일 이벤트 조회
 */
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  /**
   * 새로운 이벤트를 등록합니다.
   * 1) 동일 이름·조건 타입·기간에 겹치는 이벤트가 있는지 검사
   * 2) 충돌이 없으면 이벤트 생성
   *
   * @param dto - 이벤트 등록 요청 DTO
   * @throws ConflictException 기간이 겹치는 이벤트가 이미 존재하는 경우
   * @returns 생성된 이벤트 ID와 이름
   */
  async register(dto: EventRegisterRequest): Promise<EventRegisterResponse> {
    const conflict = await this.eventRepository.findConflict(
      dto.name,
      dto.conditionType,
      dto.startAt,
      dto.endAt,
    );

    if (conflict) {
      throw new ConflictException(
        `이벤트 ${dto.name}가 이미 겹치는 기간에 존재합니다.`,
      );
    }

    const created = await this.eventRepository.create({
      name: dto.name,
      description: dto.description,
      conditionType: dto.conditionType,
      conditionParams: this.buildConditionParams(dto),
      startAt: dto.startAt,
      endAt: dto.endAt,
      isActive: dto.isActive ?? true,
    });

    return {
      status: 'SUCCESS',
      message: '이벤트 생성 성공',
      id: created.id,
      name: created.name,
    };
  }

  /**
   * 주어진 필터 조건에 따라 이벤트 목록을 조회합니다.
   * - deletedAt이 없는(soft‑delete되지 않은) 이벤트만 포함
   * - name, conditionType, isActive, 시작일·종료일 범위 필터 지원
   *
   * @param dto - 이벤트 조회 필터 DTO
   * @returns 필터링된 이벤트 리스트
   */
  async getFilterEvents(dto: EventFilterRequest): Promise<GetAllEventResponse> {
    const baseQuery: FilterQuery<EventDocument> = {
      deletedAt: { $exists: false },
    };

    const filter: FilterQuery<EventDocument> = {
      ...baseQuery,
      ...(dto.name && { name: dto.name }),
      ...(dto.conditionType && { conditionType: dto.conditionType }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.startAt && { startAt: { $gte: dto.startAt } }),
      ...(dto.endAt && { endAt: { $lte: dto.endAt } }),
    };

    const filteredEvents = await this.eventRepository.findByFilters(filter);

    const events: EventResponse[] = filteredEvents.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      conditionType: e.conditionType,
      conditionParams: e.conditionParams,
      startAt: e.startAt,
      endAt: e.endAt,
      isActive: e.isActive,
    }));

    return {
      status: 'SUCCESS',
      message: '모든 이벤트 조회 성공',
      events,
    };
  }

  /**
   * 단일 이벤트를 ID로 조회합니다.
   *
   * @param id - 조회할 이벤트의 고유 ID
   * @throws NotFoundException 해당 ID의 이벤트가 없는 경우
   * @returns 조회된 이벤트 상세 정보
   */
  async getEvent(id: string): Promise<GetEventResponse> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`이벤트가 없습니다. :${id}`);
    }

    const result: EventResponse = {
      id: event.id,
      name: event.name,
      description: event.description,
      conditionType: event.conditionType,
      conditionParams: event.conditionParams,
      startAt: event.startAt,
      endAt: event.endAt,
      isActive: event.isActive,
    };

    return {
      status: 'SUCCESS',
      message: '이벤트 조회 성공',
      event: result,
    };
  }

  /**
   * DTO에 설정된 conditionType에 따라
   * conditionParams 객체를 생성합니다.
   *
   * @param dto - 이벤트 등록 요청 DTO
   * @returns conditionParams로 사용할 객체
   */
  private buildConditionParams(dto: EventRegisterRequest) {
    switch (dto.conditionType) {
      case ConditionType.CONSECUTIVE_LOGIN:
        return { days: dto.days };
      default:
        return {};
    }
  }
}
