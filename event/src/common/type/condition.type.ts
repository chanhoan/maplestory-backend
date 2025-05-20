/**
 * 이벤트 조건 타입을 나타내는 열거형입니다.
 * - CONSECUTIVE_LOGIN: 연속 로그인 횟수를 조건으로 하는 이벤트
 */
export enum ConditionType {
  /**
   * 연속 로그인 일수를 조건으로 하는 이벤트
   */
  CONSECUTIVE_LOGIN = 'CONSECUTIVE_LOGIN',
}
