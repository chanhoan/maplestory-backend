import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from './basic.response';

/**
 * 사용자 프로필 조회 결과를 반환하는 DTO입니다.
 */
export class GetProfileResponse extends BasicResponse {
  /**
   * 사용자명
   */
  @ApiProperty({
    description: '사용자명',
    example: 'chanhoan',
  })
  username: string;

  /**
   * 사용자 이메일 주소
   */
  @ApiProperty({
    description: '이메일',
    example: 'chanhoan01@gmail.com',
  })
  email: string;

  /**
   * 프로필 정보
   * - nickname: string
   * - phone: string
   */
  @ApiProperty({
    description: '사용자 프로필 정보',
    example: { nickname: 'chanchan', phone: '01011112222' },
  })
  profile: Record<string, any>;
}
