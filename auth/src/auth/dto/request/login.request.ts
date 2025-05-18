import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 사용자 로그인 요청을 위한 DTO입니다.
 */
export class LoginRequest {
  /**
   * 로그인할 사용자명
   */
  @ApiProperty({
    description: '로그인할 사용자명',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty({ message: 'username은 필수 항목입니다.' })
  username: string;

  /**
   * 로그인할 비밀번호
   */
  @ApiProperty({
    description: '로그인할 비밀번호',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty({ message: 'password은 필수 항목입니다.' })
  password: string;
}
