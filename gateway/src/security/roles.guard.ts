import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/public.decorator';
import { ROLES_KEY } from '../common/roles.decorator';

/**
 * 요청에 설정된 역할(roles) 메타데이터를 검사하여
 * 해당 사용자가 요청을 수행할 권한이 있는지 판단하는 가드입니다.
 *
 * - @Public() 경로는 인증·권한 검사를 건너뜁니다.
 * - @Roles(...) 데코레이터로 지정된 역할이 없으면 허용합니다.
 * - '*' 역할이 지정된 경우 모든 인증 사용자가 허용됩니다.
 * - 인증되지 않은 사용자 요청 시 UnauthorizedException 발생.
 * - 권한이 맞지 않으면 ForbiddenException 발생.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 요청 컨텍스트를 통해 핸들러 및 컨트롤러에 설정된
   * Public 또는 Roles 메타데이터를 조회하고,
   * 사용자 정보(req.user)에 기반해 허용 여부를 반환합니다.
   *
   * @param ctx - 실행 컨텍스트
   * @returns 요청 허용 시 true, 아니면 예외를 던집니다.
   */
  canActivate(ctx: ExecutionContext): boolean {
    // Public 경로는 무조건 허용
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 필요한 역할 목록을 조회
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    // 역할 지정이 없으면 허용
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 요청 객체에서 user 정보 추출
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('인증이 필요합니다.');
    }

    // 와일드카드 '*' 처리: 모든 인증 사용자 허용
    if (requiredRoles.includes('*')) {
      return true;
    }

    // 지정된 역할에 없으면 거부
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
