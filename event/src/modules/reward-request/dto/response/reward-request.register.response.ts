import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/response/basic.response';

/**
 * 보상 요청 등록 성공 시 반환되는 응답 DTO입니다.
 */
export class RewardRequestRegisterResponse extends BasicResponse {
  /**
   * 생성된 보상 요청의 고유 ID
   */
  @ApiProperty({
    description: '생성된 보상 요청의 고유 ID',
    example: '605c5f8f1c4ae23f84d8b456',
  })
  id: string;

  /**
   * 보상 요청이 연관된 이벤트의 ID
   */
  @ApiProperty({
    description: '보상 요청이 연관된 이벤트의 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  eventId: string;
}
