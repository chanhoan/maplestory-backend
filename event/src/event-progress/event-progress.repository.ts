import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventProgress, EventProgressDocument } from './event-progress.schema';

@Injectable()
export class EventProgressRepository {
  constructor(
    @InjectModel(EventProgress.name)
    private readonly eventProgressModel: Model<EventProgressDocument>,
  ) {}

  /**
   * 로그인 이벤트 발생 시, 해당 사용자-이벤트의 진행 상태를 upsert 합니다.
   * - 문서가 없으면 생성, 있으면 progress를 증가시킵니다.
   * - required 값에 도달하면 eligible 필드를 true로 설정합니다.
   *
   * @param userId - 대상 사용자 ID
   * @param eventId - 대상 이벤트 ID
   * @param required - 완료로 간주할 최소 진행 횟수
   * @returns 저장된 EventProgress 도큐먼트
   */
  async upsertLoginProgress(
    userId: string,
    eventId: string,
    required: number,
  ): Promise<EventProgressDocument> {
    const now = new Date();

    const baseFilter = {
      userId,
      eventId,
      $or: [{ deletedAt: { $exists: false } }],
    };

    const doc = await this.eventProgressModel.findOne(baseFilter).exec();

    if (!doc) {
      const progress = 1;
      const eligible = progress >= required;
      const newDoc = new this.eventProgressModel({
        userId,
        eventId,
        progress,
        required,
        eligible,
        lastUpdate: now,
      });
      return newDoc.save();
    }

    if (doc.eligible) {
      return doc;
    }

    doc.progress += 1;
    doc.lastUpdate = now;
    doc.eligible = doc.progress >= required;
    return doc.save();
  }

  async findByUserAndEvent(data: {
    userId: string;
    eventId: string;
  }): Promise<EventProgressDocument | null> {
    return this.eventProgressModel.findOne({
      userId: data.userId,
      eventId: data.eventId,
      deletedAt: { $exists: false },
    });
  }

  async softDeleteByUser(userId: string): Promise<number> {
    const res = await this.eventProgressModel
      .updateMany(
        {
          userId: userId,
          deletedAt: { $exists: false },
        },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
    return res.modifiedCount;
  }

  async restoreByUser(userId: string): Promise<number> {
    const res = await this.eventProgressModel
      .updateMany(
        {
          userId: userId,
          deletedAt: { $exists: true },
        },
        { $unset: { deletedAt: '' } },
      )
      .exec();
    return res.modifiedCount;
  }
}
