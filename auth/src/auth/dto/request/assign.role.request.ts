import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../user.role';

/**
 * 사용자에게 특정 역할을 할당하기 위한 요청 DTO입니다.
 */
export class AssignRoleRequest {
  /**
   * 권한을 할당할 대상 사용자 ID
   */
  @ApiProperty({
    description: '권한을 할당할 대상 사용자 ID',
    example: '605c5f8f1c4ae23f84d8b123',
  })
  @IsString()
  @IsNotEmpty({ message: 'userId는 비어 있을 수 없습니다.' })
  userId: string;

  /**
   * 할당할 역할
   */
  @ApiProperty({
    description: '할당할 사용자 역할',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole, {
    message: `role은 ${Object.values(UserRole).join(', ')} 중 하나여야 합니다.`,
  })
  @IsNotEmpty({ message: 'role을 반드시 지정해야 합니다.' })
  role: UserRole;
}
