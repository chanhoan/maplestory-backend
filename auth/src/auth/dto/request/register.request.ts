import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 새로운 사용자를 등록하기 위한 요청 DTO입니다.
 */
export class RegisterRequest {
  /**
   * 로그인에 사용할 고유한 아이디
   */
  @ApiProperty({ description: '아이디', example: 'chanhoan' })
  @IsString()
  @IsNotEmpty({ message: 'username은 필수 항목입니다.' })
  username: string;

  /**
   * 사용자 이메일 주소
   */
  @ApiProperty({ description: '이메일', example: 'chanhoan01@gmail.com' })
  @IsEmail({}, { message: '유효한 email을 입력하세요.' })
  email: string;

  /**
   * 계정 비밀번호
   * - 최소 8자
   * - 숫자 및 영문자 포함
   */
  @ApiProperty({ description: '비밀번호', example: 'asdf1234' })
  @IsString()
  @IsNotEmpty({ message: 'password은 필수 항목입니다.' })
  @Matches(/^(?=.*\d)(?=.*[A-Za-z]).{8,}$/, {
    message: '비밀번호는 최소 8자, 숫자·영문자를 포함해야 합니다.',
  })
  password: string;

  /**
   * 사용자 닉네임
   */
  @ApiProperty({ description: '닉네임', example: 'chanchan' })
  @IsString()
  @IsNotEmpty({ message: 'nickname은 필수 항목입니다.' })
  nickname: string;

  /**
   * 연락 가능한 핸드폰 번호
   * - 국제번호(optional) + 숫자 9~15자리
   */
  @ApiProperty({ description: '핸드폰 번호', example: '01011112222' })
  @IsString()
  @IsNotEmpty({ message: 'phone은 필수 항목입니다.' })
  @Matches(/^\+?\d{9,15}$/, {
    message: '유효한 phone 번호를 입력하세요.',
  })
  phone: string;
}
