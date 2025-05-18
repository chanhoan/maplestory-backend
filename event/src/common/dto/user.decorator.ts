/**
 * 인증 미들웨어/가드에서 디코딩된 JWT 페이로드를 표현하는 인터페이스입니다.
 */
export interface JwtUser {
  /** 사용자 식별자 (MongoDB ObjectId 등) */
  userId: string;

  /** 사용자명 */
  username: string;

  /** 사용자의 역할 (UserRole) */
  role: string;

  /** JWT 토큰 고유 ID (JWT ID) */
  jti: string;

  /** 토큰 만료 시각 (Unix timestamp, 초 단위) */
  expiresIn: number;
}
