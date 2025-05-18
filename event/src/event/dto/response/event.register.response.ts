import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../common/dto/basic.response';

/**
 * 이벤트 등록 요청 성공 시 반환되는 응답 DTO입니다.
 */
export class EventRegisterResponse extends BasicResponse {
  /**
   * 생성된 이벤트의 고유 ID
   */
  @ApiProperty({
    description: '생성된 이벤트의 고유 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  id: string;

  /**
   * 생성된 이벤트명
   */
  @ApiProperty({
    description: '생성된 이벤트명',
    example: 'Spring Festival',
  })
  name: string;
}
