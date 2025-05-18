import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ConditionType } from './condition.type';

export type EventDocument = Event & Document;

/**
 * 이벤트 도큐먼트를 나타내는 Mongoose 스키마 클래스입니다.
 * - events 컬렉션에 매핑
 * - 자동 생성된 createdAt, updatedAt 타임스탬프 포함
 * - 버전 키(__v)는 비활성화
 */
@Schema({
  collection: 'events',
  timestamps: true,
  versionKey: false,
})
export class Event {
  /**
   * 이벤트명
   * - 인덱스를 걸어 빠른 검색 지원
   */
  @Prop({ required: true, index: true })
  name: string;

  /**
   * 이벤트 상세 설명 (선택 사항)
   */
  @Prop()
  description?: string;

  /**
   * 이벤트 조건 타입
   * - ConditionType 열거형 사용
   */
  @Prop({ required: true })
  conditionType: ConditionType;

  /**
   * 조건 타입별 추가 파라미터
   * - 예: { days: 7 } 또는 { threshold: 1000 } 형태
   * - Mixed 타입으로 자유로운 구조 허용
   */
  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  conditionParams: Record<string, any>;

  /**
   * 이벤트 시작 시각
   * - 인덱스를 걸어 기간 검색 최적화
   */
  @Prop({ required: true, index: true })
  startAt: Date;

  /**
   * 이벤트 종료 시각
   * - 인덱스를 걸어 기간 검색 최적화
   */
  @Prop({ required: true, index: true })
  endAt: Date;

  /**
   * 이벤트 운영 여부
   * - 기본값 true
   * - 인덱스를 걸어 활성 이벤트 조회 최적화
   */
  @Prop({ default: true, index: true })
  isActive: boolean;

  /**
   * soft delete 시 사용되는 삭제 시각
   * - null 이면 아직 삭제되지 않음
   */
  @Prop()
  deletedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
