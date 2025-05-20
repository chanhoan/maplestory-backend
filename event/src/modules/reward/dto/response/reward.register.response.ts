import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { BasicResponse } from '../../../../common/response/basic.response';

/**
 * 보상 등록 요청 성공 시 반환되는 응답 DTO입니다.
 */
export class RewardRegisterResponse extends BasicResponse {
  /**
   * 생성된 보상의 고유 ID
   */
  @ApiProperty({
    description: '생성된 보상의 고유 ID',
    example: '60f1b5e12c4a3a4567890def',
  })
  id: string;

  /**
   * 보상이 연관된 이벤트의 ObjectId
   */
  @ApiProperty({
    description: '연관된 이벤트의 ObjectId',
    type: String,
    example: '60f1b5e12c4a3a4567890abc',
  })
  eventId: Types.ObjectId;
}
