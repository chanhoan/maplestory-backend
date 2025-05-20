import { IsEnum, IsNumber, Min, ValidateIf, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '../../../../common/type/reward.type';

/**
 * 새로운 보상을 등록하기 위한 요청 DTO입니다.
 */
export class RewardRegisterRequest {
  /**
   * 보상을 등록할 이벤트의 고유 ID
   */
  @ApiProperty({
    description: '보상을 등록할 이벤트의 고유 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  @IsString({ message: 'eventId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'eventId는 필수 항목입니다.' })
  eventId: string;

  /**
   * 보상 종류
   */
  @ApiProperty({
    enum: RewardType,
    description: '보상 종류',
    example: RewardType.POINT,
  })
  @IsEnum(RewardType, {
    message: `type은 ${Object.values(RewardType).join(', ')} 중 하나여야 합니다.`,
  })
  @IsNotEmpty({ message: 'type은 필수 항목입니다.' })
  type: RewardType;

  /**
   * 포인트 보상 수량
   * - type이 POINT인 경우에만 필수
   */
  @ApiPropertyOptional({
    description: '포인트 수량 (type=POINT)',
    example: 1000,
  })
  @ValidateIf((o) => o.type === RewardType.POINT)
  @IsNumber({}, { message: 'amount는 숫자여야 합니다.' })
  @Min(1, { message: 'amount는 최소 1 이상이어야 합니다.' })
  amount?: number;
}
