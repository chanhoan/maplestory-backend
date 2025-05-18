import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from './basic.response';
import { UserDto } from './use.dto';

/**
 * 모든 사용자 목록을 포함한 응답 DTO입니다.
 */
export class AllUserResponse extends BasicResponse {
  /**
   * 조회된 사용자 리스트
   */
  @ApiProperty({
    description: '조회된 사용자 리스트',
    type: [UserDto],
  })
  users: UserDto[];
}
