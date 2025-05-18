import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Reward, RewardDocument } from './reward.schema';

@Injectable()
export class RewardRepository {
  constructor(
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async create(data: {
    eventId: string;
    type: string;
    metadata: Record<string, any>;
  }): Promise<RewardDocument> {
    const created = new this.rewardModel({
      eventId: data.eventId,
      type: data.type,
      metadata: data.metadata,
    });
    return created.save();
  }

  async findAll(): Promise<RewardDocument[]> {
    return this.rewardModel.find({ deletedAt: { $exists: false } }).exec();
  }

  async findByEvent(eventId: string): Promise<RewardDocument | null> {
    return this.rewardModel
      .findOne({ eventId, deletedAt: { $exists: false } })
      .exec();
  }

  async findByFilters(filters: {
    eventId?: string;
    type?: string;
  }): Promise<RewardDocument[]> {
    const query: FilterQuery<RewardDocument> = {
      deletedAt: { $exists: false },
      ...(filters.eventId && { eventId: filters.eventId }),
      ...(filters.type && { type: filters.type }),
    };
    return this.rewardModel.find(query).exec();
  }
}
