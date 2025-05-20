import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../../common/response/basic.response';
import { RewardRequestResponse } from './reward-request.response';

/**
 * 단일 보상 요청 상세 조회 응답 DTO입니다.
 */
export class GetRewardRequestResponse extends BasicResponse {
  /**
   * 조회된 보상 요청 정보
   */
  @ApiProperty({
    description: '조회된 보상 요청 상세 정보',
    type: RewardRequestResponse,
  })
  rewardRequest: RewardRequestResponse;
}
