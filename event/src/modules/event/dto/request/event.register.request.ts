import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionType } from '../../../../common/type/condition.type';

/**
 * 새로운 이벤트 등록을 위한 요청 DTO입니다.
 */
export class EventRegisterRequest {
  /**
   * 이벤트명
   */
  @ApiProperty({ description: '이벤트명', example: 'Spring Festival' })
  @IsString({ message: 'name은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'name은 필수 항목입니다.' })
  name: string;

  /**
   * 이벤트 상세 설명
   */
  @ApiPropertyOptional({ description: '상세 설명', example: '봄맞이 특별 보상 이벤트' })
  @IsString({ message: 'description은 문자열이어야 합니다.' })
  @IsOptional()
  description?: string;

  /**
   * 이벤트 조건 타입
   */
  @ApiProperty({
    description: '이벤트 조건 타입',
    enum: ConditionType,
    example: ConditionType.CONSECUTIVE_LOGIN,
  })
  @IsEnum(ConditionType, {
    message: `conditionType은 ${Object.values(ConditionType).join(
      ', ',
    )} 중 하나여야 합니다.`,
  })
  conditionType: ConditionType;

  /**
   * 연속 로그인 일수
   * - conditionType이 CONSECUTIVE_LOGIN인 경우에만 필수
   */
  @ApiPropertyOptional({
    description: '연속 로그인 일수 (conditionType=CONSECUTIVE_LOGIN)',
    example: 7,
  })
  @ValidateIf((o) => o.conditionType === ConditionType.CONSECUTIVE_LOGIN)
  @IsInt({ message: 'days는 정수여야 합니다.' })
  @Min(1, { message: 'days는 최소 1 이상이어야 합니다.' })
  days?: number;

  /**
   * 이벤트 시작 시각 (ISO 8601 형식)
   */
  @ApiProperty({
    description: '시작 시각 (ISO8601)',
    example: '2025-05-20T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'startAt은 ISO8601 날짜 문자열이어야 합니다.' })
  startAt: Date;

  /**
   * 이벤트 종료 시각 (ISO 8601 형식)
   */
  @ApiProperty({
    description: '종료 시각 (ISO8601)',
    example: '2025-06-01T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'endAt은 ISO8601 날짜 문자열이어야 합니다.' })
  endAt: Date;

  /**
   * 운영 여부
   * - 기본값 true
   */
  @ApiPropertyOptional({
    description: '운영 여부 (default: true)',
    example: true,
  })
  @IsBoolean({ message: 'isActive는 불리언이어야 합니다.' })
  @IsOptional()
  isActive?: boolean = true;
}
