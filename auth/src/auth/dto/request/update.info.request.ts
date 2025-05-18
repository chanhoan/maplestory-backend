import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 사용자 프로필 정보를 업데이트하기 위한 DTO입니다.
 */
export class UpdateInfoRequest {
  /**
   * 변경할 이메일 주소
   */
  @ApiPropertyOptional({
    description: '변경할 이메일 주소',
    example: 'new.email@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '유효한 email을 입력하세요.' })
  email?: string;

  /**
   * 변경할 닉네임
   */
  @ApiPropertyOptional({
    description: '변경할 닉네임',
    example: 'newNickname',
  })
  @IsOptional()
  @IsString({ message: 'nickname은 문자열이어야 합니다.' })
  nickname?: string;

  /**
   * 변경할 핸드폰 번호
   * - 국제번호(optional) + 숫자 9~15자리
   */
  @ApiPropertyOptional({
    description: '변경할 핸드폰 번호',
    example: '01098765432',
  })
  @IsOptional()
  @IsString({ message: 'phone은 문자열이어야 합니다.' })
  @Matches(/^\+?\d{9,15}$/, {
    message: '유효한 phone 번호를 입력하세요.',
  })
  phone?: string;
}
