import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/response/basic.response';
import { EventResponse } from './event.response';

/**
 * 전체 이벤트 목록 조회 응답 DTO입니다.
 */
export class GetAllEventResponse extends BasicResponse {
  /**
   * 조회된 이벤트 리스트
   */
  @ApiProperty({
    description: '조회된 이벤트 리스트',
    type: [EventResponse],
  })
  events: EventResponse[];
}
