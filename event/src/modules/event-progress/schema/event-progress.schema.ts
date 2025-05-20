import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Event } from '../../event/schema/event.schema';

export type EventProgressDocument = EventProgress & Document;

/**
 * 사용자별 이벤트 진행 상태를 저장하는 Mongoose 스키마입니다.
 * - event_progress 컬렉션에 매핑됩니다.
 * - userId, eventId로 복합 유니크 인덱스를 설정합니다.
 */
@Schema({ collection: 'event_progress' })
export class EventProgress {
  /**
   * 진행 상태를 기록하는 사용자 ID(ObjectId).
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  /**
   * 해당 진행 상태가 연관된 이벤트 ID(ObjectId).
   * - Event 스키마를 참조(ref)합니다.
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Event.name,
    required: true,
    index: true,
  })
  eventId: Types.ObjectId;

  /**
   * 현재까지의 진행 횟수 또는 점수.
   */
  @Prop({ required: true, default: 0 })
  progress: number;

  /**
   * 목표 완료로 간주할 최소 진행 횟수.
   */
  @Prop({ required: true })
  required: number;

  /**
   * 완료 여부 플래그.
   * - progress >= required 일 때 true가 됩니다.
   */
  @Prop({ required: true, default: false })
  eligible: boolean;

  /**
   * 마지막으로 진행 상태가 업데이트된 시각.
   */
  @Prop({ type: Date, required: true, default: () => new Date() })
  lastUpdate: Date;

  /**
   * soft-delete 시점을 기록합니다.
   * - 존재하지 않으면 삭제되지 않은 상태를 의미합니다.
   */
  @Prop()
  deletedAt?: Date;
}

export const EventProgressSchema = SchemaFactory.createForClass(EventProgress);

// userId + eventId 복합 유니크 인덱스 설정
EventProgressSchema.index({ userId: 1, eventId: 1 }, { unique: true });
