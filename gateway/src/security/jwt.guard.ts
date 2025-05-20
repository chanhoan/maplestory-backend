import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

/**
 * JWT 인증 가드를 확장하여,
 * - Public 경로는 인증 없이 접근 허용
 * - Public 설정이 없으면 Passport 'jwt' 전략으로 인증 처리
 * - 인증 실패 시 UnauthorizedException 발생
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * @param reflector - 메타데이터를 읽어오는 Reflector 인스턴스
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 요청이 Public 경로인지 확인하고,
   * Public이 아니면 Passport JWT 인증을 수행합니다.
   *
   * @param context - 실행 컨텍스트 (컨트롤러 핸들러, 클래스 등)
   * @returns 인증 성공 여부
   * @throws UnauthorizedException 유효한 토큰이 없으면 발생
   */
  canActivate(context: ExecutionContext) {
    // @Public() 데코레이터가 붙은 핸들러/클래스인지 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // JWT 인증 수행
    const activated = super.canActivate(context) as boolean;
    if (!activated) {
      throw new UnauthorizedException('유효한 토큰이 필요합니다.');
    }
    return activated;
  }

  /**
   * 인증 결과를 처리합니다.
   *
   * @param err - 인증 과정 중 에러
   * @param user - 성공적으로 인증된 사용자 정보
   * @returns 사용자 정보
   * @throws UnauthorizedException 인증 실패 시 발생
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('유효한 토큰이 필요합니다.');
    }
    return user;
  }
}
