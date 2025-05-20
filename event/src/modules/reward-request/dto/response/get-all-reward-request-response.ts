import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/response/basic.response';
import { RewardRequestResponse } from './reward-request.response';

/**
 * 모든 보상 요청 목록을 포함한 응답 DTO입니다.
 */
export class GetAllRewardRequestResponse extends BasicResponse {
  /**
   * 조회된 보상 요청 리스트
   */
  @ApiProperty({
    description: '조회된 보상 요청 리스트',
    type: [RewardRequestResponse],
  })
  rewardRequests: RewardRequestResponse[];
}
