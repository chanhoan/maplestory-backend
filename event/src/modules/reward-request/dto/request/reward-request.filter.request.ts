import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 보상 요청 조회 시 사용할 필터링 파라미터 DTO입니다.
 */
export class RewardRequestFilterRequest {
  /**
   * 조회할 사용자 ID
   */
  @ApiPropertyOptional({
    description: '조회할 사용자 ID',
    example: '605c5f8f1c4ae23f84d8b123',
  })
  @IsOptional()
  @IsString({ message: 'userId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'userId가 비어 있을 수 없습니다.' })
  userId?: string;

  /**
   * 조회할 이벤트 ID
   */
  @ApiPropertyOptional({
    description: '조회할 이벤트 ID',
    example: '60f1b5e12c4a3a4567890abc',
  })
  @IsOptional()
  @IsString({ message: 'eventId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'eventId가 비어 있을 수 없습니다.' })
  eventId?: string;

  /**
   * 조회할 요청 상태
   * - 예: 'PENDING', 'APPROVED', 'REJECTED' 등
   */
  @ApiPropertyOptional({
    description: '조회할 요청 상태',
    example: 'PENDING',
  })
  @IsOptional()
  @IsString({ message: 'status는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'status가 비어 있을 수 없습니다.' })
  status?: string;
}
