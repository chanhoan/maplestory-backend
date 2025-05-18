import { ApiProperty } from '@nestjs/swagger';

/**
 * 모든 API 응답에 공통으로 포함되는 기본 응답 DTO입니다.
 */
export class BasicResponse {
  /**
   * 처리 결과 상태
   * - SUCCESS, FAILURE 등의 상태 코드
   */
  @ApiProperty({
    description: '처리 결과 상태',
    example: 'SUCCESS',
  })
  status: string;

  /**
   * 처리 결과에 대한 상세 메시지
   */
  @ApiProperty({
    description: '상세 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;
}
