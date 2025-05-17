export interface JwtUser {
  username: string;
  role: string;
  jti: string;
  expiresIn: number;
}
