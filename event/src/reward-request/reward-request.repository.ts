import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  RewardRequest,
  RewardRequestDocument,
  RewardRequestStatus,
} from './reward-request.schema';
import { RewardRequestFilterRequest } from './dto/request/reward-request.filter.request';

@Injectable()
export class RewardRequestRepository {
  constructor(
    @InjectModel(RewardRequest.name)
    private readonly rewardRequestModel: Model<RewardRequestDocument>,
  ) {}

  async create(data: {
    userId: string;
    eventId: string;
    status: RewardRequestStatus;
  }): Promise<RewardRequestDocument> {
    const created = new this.rewardRequestModel({
      userId: data.userId,
      eventId: data.eventId,
      status: data.status,
    });
    return created.save();
  }

  async findById(id: string): Promise<RewardRequestDocument | null> {
    return await this.rewardRequestModel
      .findOne({
        _id: id,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async findByUserAndEvent(data: {
    userId: string;
    eventId: string;
  }): Promise<RewardRequestDocument | null> {
    return await this.rewardRequestModel
      .findOne({
        userId: data.userId,
        eventId: data.eventId,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  /**
   * 보상 요청을 bulk로 승인 처리합니다.
   * - matching 문서를 찾아 상태를 APPROVED로 변경하고 processedAt을 설정
   *
   * @param data.userId - 사용자 ID
   * @param data.eventId - 이벤트 ID
   * @returns 업데이트된 RewardRequest 도큐먼트 또는 null
   */
  async bulkApprove(data: {
    userId: string;
    eventId: string;
  }): Promise<RewardRequestDocument | null> {
    const now = new Date();

    return this.rewardRequestModel.findOneAndUpdate(
      {
        userId: data.userId,
        eventId: data.eventId,
        deletedAt: { $exists: false },
      },
      {
        $set: { status: RewardRequestStatus.APPROVED, processedAt: now },
      },
      {
        new: true,
      },
    );
  }

  async softDeleteByUser(userId: string): Promise<number> {
    const res = await this.rewardRequestModel
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
    const res = await this.rewardRequestModel
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

  async findByFilters(
    filters: Partial<RewardRequestFilterRequest>,
  ): Promise<RewardRequestDocument[]> {
    const query: FilterQuery<RewardRequestDocument> = {
      deletedAt: { $exists: false },
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.eventId && { eventId: filters.eventId }),
      ...(filters.status && { status: filters.status }),
    };
    return this.rewardRequestModel.find(query).exec();
  }
}
