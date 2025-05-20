import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/response/basic.response';
import { RewardResponse } from './reward.response';

/**
 * 전체 보상 목록 조회 응답 DTO입니다.
 */
export class GetAllRewardResponse extends BasicResponse {
  /**
   * 조회된 보상 리스트
   */
  @ApiProperty({
    description: '조회된 보상 리스트',
    type: [RewardResponse],
  })
  rewards: RewardResponse[];
}
