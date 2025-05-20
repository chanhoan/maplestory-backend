import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Event } from '../../event/schema/event.schema';

export type RewardRequestDocument = RewardRequest & Document;

/**
 * 보상 요청 상태를 나타내는 열거형입니다.
 */
export enum RewardRequestStatus {
  /** 요청 대기 중 */
  PENDING = 'PENDING',
  /** 요청 승인됨 */
  APPROVED = 'APPROVED',
  /** 요청 거부됨 */
  REJECTED = 'REJECTED',
}

/**
 * 사용자 보상 요청을 저장하는 Mongoose 스키마입니다.
 * - reward_requests 컬렉션에 매핑
 * - createdAt/updatedAt 타임스탬프 포함
 * - 버전 키(__v) 비활성화
 */
@Schema({
  collection: 'reward_requests',
  timestamps: true,
  versionKey: false,
})
export class RewardRequest {
  /**
   * 요청한 사용자 ID (ObjectId)
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  /**
   * 보상 요청이 연관된 이벤트의 ID (ObjectId)
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Event.name,
    required: true,
    index: true,
  })
  eventId: Types.ObjectId;

  /**
   * 요청 상태 (PENDING | APPROVED | REJECTED)
   */
  @Prop({
    type: String,
    enum: RewardRequestStatus,
    default: RewardRequestStatus.PENDING,
    index: true,
  })
  status: RewardRequestStatus;

  /**
   * 요청 생성 시각 (자동 설정)
   */
  @Prop({
    type: Date,
    default: () => new Date(),
    index: true,
  })
  requestedAt: Date;

  /**
   * 요청 처리 완료 시각
   */
  @Prop({ type: Date })
  processedAt?: Date;

  /**
   * 요청을 처리한 운영자 ID (ObjectId)
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  operatorId?: Types.ObjectId;

  /**
   * 요청 거부 사유 (status = REJECTED인 경우)
   */
  @Prop()
  reason?: string;

  /**
   * soft-delete 시점을 기록합니다.
   * - 해당 필드가 존재하면 삭제된 상태로 간주
   */
  @Prop()
  deletedAt?: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

// userId + eventId 조합에 대해 soft-delete되지 않은 문서만 유니크 제약을 적용
RewardRequestSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $exists: false } } },
);
