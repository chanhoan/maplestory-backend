import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { RewardRequestStatus } from '../../reward-request.schema';

/**
 * 보상 요청 상세 정보를 나타내는 DTO입니다.
 */
export class RewardRequestResponse {
  /**
   * 보상 요청 고유 ID
   */
  @ApiProperty({
    description: '보상 요청 고유 ID',
    example: '605c5f8f1c4ae23f84d8b456',
  })
  id: string;

  /**
   * 요청한 사용자 ID
   */
  @ApiProperty({
    description: '요청한 사용자 ID',
    type: String,
    example: '605c5f8f1c4ae23f84d8b123',
  })
  userId: Types.ObjectId;

  /**
   * 요청된 이벤트 ID
   */
  @ApiProperty({
    description: '요청된 이벤트 ID',
    type: String,
    example: '60f1b5e12c4a3a4567890abc',
  })
  eventId: Types.ObjectId;

  /**
   * 보상 요청 상태
   */
  @ApiProperty({
    description: '보상 요청 상태',
    enum: RewardRequestStatus,
    example: RewardRequestStatus.PENDING,
  })
  status: RewardRequestStatus;

  /**
   * 요청 시각 (ISO 8601)
   */
  @ApiProperty({
    description: '요청 시각',
    example: '2025-05-20T12:34:56.789Z',
  })
  requestedAt: Date;

  /**
   * 처리 완료 시각 (ISO 8601)
   */
  @ApiPropertyOptional({
    description: '처리 완료 시각',
    example: '2025-05-21T08:00:00.000Z',
  })
  processedAt?: Date;

  /**
   * 요청 처리한 운영자 ID
   */
  @ApiPropertyOptional({
    description: '요청 처리한 운영자 ID',
    type: String,
    example: '605c5f8f1c4ae23f84d8b789',
  })
  operatorId?: Types.ObjectId;

  /**
   * 요청 거부 사유 (status=REJECTED인 경우)
   */
  @ApiPropertyOptional({
    description: '요청 거부 사유',
    example: '조건 미충족',
  })
  reason?: string;
}
