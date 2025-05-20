import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * @Public() 가 붙은 핸들러/컨트롤러는
 * JwtAuthGuard와 RoleGuard 에서 인증을 스킵하도록 표시합니다.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
