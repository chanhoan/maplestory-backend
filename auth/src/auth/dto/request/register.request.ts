import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequest {
  @IsString()
  @ApiProperty({ description: '아이디', example: 'chanhoan' })
  @IsNotEmpty({ message: 'username은 필수 항목입니다.' })
  username: string;

  @IsEmail({}, { message: '유효한 email을 입력하세요.' })
  @ApiProperty({ description: '이메일', example: 'chanhoan01@gmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password은 필수 항목입니다.' })
  @Matches(/^(?=.*\d)(?=.*[A-Za-z]).{8,}$/, {
    message: '비밀번호는 최소 8자, 숫자·영문자를 포함해야 합니다.',
  })
  @ApiProperty({ description: '비밀번호', example: 'asdf1234' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'nickname은 필수 항목입니다.' })
  @ApiProperty({ description: '닉네임', example: 'chanchan' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: 'phone은 필수 항목입니다.' })
  @Matches(/^\+?\d{9,15}$/, {
    message: '유효한 phone 번호를 입력하세요.',
  })
  @ApiProperty({ description: '핸드폰 번호', example: '01011112222' })
  phone: string;
}
