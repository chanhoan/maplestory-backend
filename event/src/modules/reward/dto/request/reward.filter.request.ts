import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RewardType } from '../../../../common/type/reward.type';

/**
 * 보상 조회 시 필터링할 파라미터를 정의하는 요청 DTO입니다.
 */
export class RewardFilterRequest {
  /**
   * 조회할 이벤트의 고유 ID
   */
  @ApiProperty({
    description: '조회할 이벤트의 고유 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  @IsString({ message: 'eventId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'eventId는 필수 항목입니다.' })
  eventId: string;

  /**
   * 조회할 보상의 유형
   */
  @ApiProperty({
    description: '조회할 보상의 유형',
    enum: RewardType,
    example: RewardType.POINT,
  })
  @IsEnum(RewardType, {
    message: `type은 ${Object.values(RewardType).join(', ')} 중 하나여야 합니다.`,
  })
  @IsNotEmpty({ message: 'type은 필수 항목입니다.' })
  type: RewardType;
}
