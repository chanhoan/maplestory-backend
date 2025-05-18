import { ApiProperty } from '@nestjs/swagger';
import { BasicResponse } from '../../../common/dto/basic.response';
import { RewardResponse } from './reward.response';

/**
 * 단일 보상 상세 조회 응답 DTO입니다.
 */
export class GetRewardResponse extends BasicResponse {
  /**
   * 조회된 보상 정보
   */
  @ApiProperty({
    description: '조회된 보상 상세 정보',
    type: RewardResponse,
  })
  reward: RewardResponse;
}
