import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { RewardType } from '../../../../common/type/reward.type';

/**
 * 보상 상세 정보를 나타내는 DTO입니다.
 */
export class RewardResponse {
  /**
   * 보상의 고유 ID
   */
  @ApiProperty({
    description: '보상의 고유 ID',
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

  /**
   * 보상 유형
   */
  @ApiProperty({
    description: '보상 유형',
    enum: RewardType,
    example: RewardType.POINT,
  })
  type: RewardType;

  /**
   * 보상 관련 추가 메타데이터
   * - 예: { amount: 1000 } 또는 기타 커스텀 정보
   */
  @ApiProperty({
    description: '보상 관련 추가 메타데이터',
    example: { amount: 1000 },
  })
  metadata: Record<string, any>;
}
