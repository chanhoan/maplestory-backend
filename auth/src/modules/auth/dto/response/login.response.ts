import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/responses/basic.response';

/**
 * 로그인 요청 성공 시 반환되는 응답 DTO입니다.
 * - 액세스 토큰 발급 결과를 포함합니다.
 */
export class LoginResponse extends BasicResponse {
  /**
   * 로그인한 사용자명
   */
  @ApiProperty({
    description: '로그인한 사용자명',
    example: 'chanhoan',
  })
  username: string;

  /**
   * 발급된 액세스 토큰
   */
  @ApiProperty({
    description: '발급된 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
