import { GetAllEventResponse } from '../dto/response/get-all-event.response';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query, HttpStatus } from '@nestjs/common';
import { EventService } from '../service/event.service';
import { EventRegisterRequest } from '../dto/request/event.register.request';
import { EventRegisterResponse } from '../dto/response/event.register.response';
import { EventFilterRequest } from '../dto/request/event.filter.request';
import { GetEventResponse } from '../dto/response/get-event.response';

/**
 * 이벤트 관련 API를 제공하는 컨트롤러입니다.
 * - 이벤트 등록
 * - 이벤트 목록 조회 (필터링 포함)
 * - 단일 이벤트 상세 조회
 */
@ApiTags('Events')
@Controller('/api/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 새로운 이벤트를 등록합니다.
   *
   * @param dto - 이벤트 등록 요청 DTO
   * @returns 등록된 이벤트의 ID와 이름을 포함한 응답 DTO
   */
  @ApiOperation({ summary: '이벤트 등록' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '이벤트 등록 성공',
    type: EventRegisterResponse,
  })
  @Post()
  register(
    @Body() dto: EventRegisterRequest,
  ): Promise<EventRegisterResponse> {
    return this.eventService.register(dto);
  }

  /**
   * 이벤트 목록을 조회합니다.
   * - 이름, 조건 타입, 활성 여부, 기간 등 다양한 필터 가능
   *
   * @param filterDto - 조회 필터 DTO
   * @returns 필터링된 이벤트 리스트를 포함한 응답 DTO
   */
  @ApiOperation({ summary: '이벤트 조회 (필터링/전체)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이벤트 조회 성공',
    type: GetAllEventResponse,
  })
  @Get()
  findAll(
    @Query() filterDto: EventFilterRequest,
  ): Promise<GetAllEventResponse> {
    return this.eventService.getFilterEvents(filterDto);
  }

  /**
   * 단일 이벤트의 상세 정보를 조회합니다.
   *
   * @param id - 조회할 이벤트의 고유 ID
   * @returns 이벤트 상세 정보를 포함한 응답 DTO
   */
  @ApiOperation({ summary: '이벤트 상세 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이벤트 상세 조회 성공',
    type: GetEventResponse,
  })
  @Get('/:id')
  getEvent(@Param('id') id: string): Promise<GetEventResponse> {
    return this.eventService.getEvent(id);
  }
}
