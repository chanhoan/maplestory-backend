import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionType } from '../../../../common/type/condition.type';

/**
 * 이벤트 조회 시 필터링할 수 있는 파라미터를 정의하는 DTO입니다.
 */
export class EventFilterRequest {
  /**
   * 이벤트명으로 필터링합니다.
   */
  @ApiPropertyOptional({
    description: '이벤트명',
    example: 'Spring Festival',
  })
  @IsOptional()
  @IsString({ message: 'name은 문자열이어야 합니다.' })
  name?: string;

  /**
   * 이벤트의 조건 타입으로 필터링합니다.
   */
  @ApiPropertyOptional({
    description: '조건 타입',
    enum: ConditionType,
    example: ConditionType.CONSECUTIVE_LOGIN,
  })
  @IsOptional()
  @IsEnum(ConditionType, {
    message: `conditionType은 ${Object.values(ConditionType).join(
      ', ',
    )} 중 하나여야 합니다.`,
  })
  conditionType?: ConditionType;

  /**
   * 운영 중(active)인 이벤트만 조회할지 여부
   */
  @ApiPropertyOptional({
    description: '운영 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive는 불리언이어야 합니다.' })
  isActive?: boolean;

  /**
   * 주어진 일자(startAt) 이후에 시작하는 이벤트만 조회합니다. (ISO 8601)
   */
  @ApiPropertyOptional({
    description: '시작일 이후 (ISO8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'startAt은 ISO8601 날짜 문자열이어야 합니다.' })
  startAt?: Date;

  /**
   * 주어진 일자(endAt) 이전에 종료되는 이벤트만 조회합니다. (ISO 8601)
   */
  @ApiPropertyOptional({
    description: '종료일 이전 (ISO8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endAt은 ISO8601 날짜 문자열이어야 합니다.' })
  endAt?: Date;
}
