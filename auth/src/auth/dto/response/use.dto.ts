import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user.role';

/**
 * 사용자 정보를 나타내는 DTO입니다.
 */
export class UserDto {
  /**
   * 사용자 고유 ID
   */
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '605c5f8f1c4ae23f84d8b123',
  })
  id: string;

  /**
   * 로그인에 사용되는 사용자명
   */
  @ApiProperty({ description: '사용자명', example: 'chanhoan' })
  username: string;

  /**
   * 사용자 이메일 주소
   */
  @ApiProperty({ description: '이메일', example: 'chanhoan01@gmail.com' })
  email: string;

  /**
   * 사용자 역할
   */
  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  /**
   * 사용자 프로필 정보
   */
  @ApiProperty({
    description: '프로필 정보',
    example: { nickname: 'chanchan', phone: '01011112222' },
  })
  profile: Record<string, any>;
}
