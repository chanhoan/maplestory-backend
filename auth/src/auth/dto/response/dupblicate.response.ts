import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from './basic.response';

/**
 * 아이디 중복 검사 결과를 반환하는 DTO입니다.
 */
export class DuplicateResponse extends BasicResponse {
  /**
   * 아이디 중복 여부
   * - `true`: 이미 존재하여 사용 불가
   * - `false`: 사용 가능
   */
  @ApiProperty({
    description: '아이디 중복 여부',
    example: false,
  })
  isDuplicate: boolean;
}
