import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { ConditionType } from './condition.type';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    conditionType: ConditionType;
    conditionParams: Record<string, any>;
    startAt: Date;
    endAt: Date;
    isActive: boolean;
  }): Promise<EventDocument> {
    const created = new this.eventModel({
      name: data.name,
      description: data.description,
      conditionType: data.conditionType,
      conditionParams: data.conditionParams,
      startAt: data.startAt,
      endAt: data.endAt,
      isActive: data.isActive,
    });
    return created.save();
  }

  async findConflict(
    name: string,
    conditionType: ConditionType,
    startAt: Date,
    endAt: Date,
  ): Promise<EventDocument | null> {
    return this.eventModel
      .findOne({
        name: name,
        conditionType: conditionType,
        deletedAt: { $exists: false },
        startAt: { $lt: startAt },
        endAt: { $gt: endAt },
      })
      .exec();
  }

  async findById(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .exec();
    if (!event) {
      throw new NotFoundException(`Event(${id}) not found`);
    }
    return event;
  }

  async findByTypeAndActive(
    conditionType: ConditionType,
  ): Promise<EventDocument[]> {
    const now = new Date();
    return this.eventModel
      .find({
        conditionType: conditionType,
        isActive: true,
        startAt: { $lte: now },
        endAt: { $gte: now },
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async findByFilters(
    filter: FilterQuery<EventDocument>,
  ): Promise<EventDocument[]> {
    return this.eventModel.find(filter).exec();
  }
}
