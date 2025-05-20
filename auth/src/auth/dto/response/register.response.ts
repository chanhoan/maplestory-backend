import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../common/responses/basic.response';

/**
 * 회원가입 요청 성공 시 반환되는 응답 DTO입니다.
 */
export class RegisterResponse extends BasicResponse {
  /**
   * 생성된 사용자명
   */
  @ApiProperty({
    description: '생성된 사용자명',
    example: 'chanhoan',
  })
  username: string;

  /**
   * 생성된 사용자 이메일 주소
   */
  @ApiProperty({
    description: '생성된 사용자 이메일 주소',
    example: 'chanhoan01@gmail.com',
  })
  email: string;
}
