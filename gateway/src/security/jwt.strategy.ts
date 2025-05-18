import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Passport 전략을 설정합니다.
 * - Authorization: Bearer 토큰에서 JWT를 추출하여 검증
 * - 검증된 페이로드를 기반으로 사용자 정보를 반환
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * @param cs - 애플리케이션 설정 서비스 (JWT 시크릿 키 로딩)
   */
  constructor(cs: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cs.get<string>('jwt.secret'),
    });
  }

  /**
   * JWT 페이로드를 검증한 후 호출됩니다.
   * Passport가 반환한 이 객체가 `@Req() user` 등에 주입됩니다.
   *
   * @param payload - 디코딩된 JWT 페이로드
   * @returns 인증된 사용자 정보 객체
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      expiresIn: payload.expiresIn,
      jti: payload.jti,
    };
  }
}
