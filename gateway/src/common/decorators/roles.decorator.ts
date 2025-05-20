import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
/**
 * @Roles('ADMIN', 'USER', '*') 처럼 사용
 * '*' 은 “인증만 되어 있으면 OK” 를 의미합니다.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
