/**
 * 사용자 역할을 정의하는 열거형
 */
export enum UserRole {
  /** 일반 사용자 권한 */
  USER = 'USER',
  /** 운영자 권한 */
  OPERATOR = 'OPERATOR',
  /** 감사자 권한 */
  AUDITOR = 'AUDITOR',
  /** 관리자 권한 */
  ADMIN = 'ADMIN',
}
