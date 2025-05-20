import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionType } from '../../../../common/type/condition.type';

/**
 * 이벤트 상세 정보를 반환하는 응답 DTO입니다.
 */
export class EventResponse {
  /**
   * 이벤트 고유 ID
   */
  @ApiProperty({
    description: '이벤트 고유 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  id: string;

  /**
   * 이벤트명
   */
  @ApiProperty({
    description: '이벤트명',
    example: 'Spring Festival',
  })
  name: string;

  /**
   * 이벤트 상세 설명
   */
  @ApiPropertyOptional({
    description: '이벤트 상세 설명',
    example: '봄맞이 특별 보상 이벤트',
  })
  description?: string;

  /**
   * 이벤트 조건 타입
   */
  @ApiProperty({
    description: '이벤트 조건 타입',
    enum: ConditionType,
    example: ConditionType.CONSECUTIVE_LOGIN,
  })
  conditionType: ConditionType;

  /**
   * 조건 타입에 따른 추가 파라미터
   * - 예: 연속 로그인 일수(days), 구매 금액(threshold) 등
   */
  @ApiProperty({
    description: '조건 타입에 따른 추가 파라미터',
    example: { days: 7 },
  })
  conditionParams: Record<string, any>;

  /**
   * 이벤트 시작 시각 (ISO 8601)
   */
  @ApiProperty({
    description: '이벤트 시작 시각 (ISO8601)',
    example: '2025-05-20T00:00:00.000Z',
  })
  startAt: Date;

  /**
   * 이벤트 종료 시각 (ISO 8601)
   */
  @ApiProperty({
    description: '이벤트 종료 시각 (ISO8601)',
    example: '2025-06-01T23:59:59.000Z',
  })
  endAt: Date;

  /**
   * 이벤트 운영 여부
   */
  @ApiProperty({
    description: '이벤트 운영 여부',
    example: true,
  })
  isActive: boolean;
}
