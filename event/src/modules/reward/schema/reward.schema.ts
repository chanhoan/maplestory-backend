import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { RewardType } from '../../../common/type/reward.type';
import { Event } from '../../event/schema/event.schema';

export type RewardDocument = Reward & Document;

/**
 * 이벤트 보상(Reward) 도큐먼트를 나타내는 Mongoose 스키마입니다.
 * - rewards 컬렉션에 매핑
 * - createdAt/updatedAt 타임스탬프 포함
 * - 버전키(__v) 비활성화
 */
@Schema({
  collection: 'rewards',
  timestamps: true,
  versionKey: false,
})
export class Reward {
  /**
   * 보상이 연관된 이벤트의 ObjectId
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Event.name,
    required: true,
    index: true,
  })
  eventId: Types.ObjectId;

  /**
   * 보상 유형 (RewardType 열거형)
   */
  @Prop({ required: true, index: true })
  type: RewardType;

  /**
   * 보상별 추가 메타데이터
   * - 예: { amount: 1000 } 또는 기타 커스텀 정보
   */
  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  metadata: Record<string, any>;

  /**
   * soft-delete 시점 기록
   * - 존재하지 않으면 활성 상태를 의미
   */
  @Prop()
  deletedAt?: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
