import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../common/dto/basic.response';
import { EventResponse } from './event.response';

/**
 * 단일 이벤트 상세 조회 응답 DTO입니다.
 */
export class GetEventResponse extends BasicResponse {
  /**
   * 조회된 이벤트 상세 정보
   */
  @ApiProperty({
    description: '조회된 이벤트 상세 정보',
    type: EventResponse,
  })
  event: EventResponse;
}
