import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.shema';
import { UserRole } from './user.role';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    profile: Record<string, any>;
  }): Promise<User> {
    const user = new this.userModel({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? UserRole.USER,
      profile: data.profile,
    });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ deletedAt: { $exists: false } }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ username: username, deletedAt: { $exists: false } })
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return await this.userModel
      .findOneAndUpdate({ _id: id, deletedAt: { $exists: false } }, data, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async updateRole(id: string, role: UserRole): Promise<UserDocument | null> {
    return await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: { $exists: false } },
        { role },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: { $exists: false } },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
  }

  async restoreById(id: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true } },
      { $unset: { deletedAt: '' } },
      { new: true, runValidators: true },
    );
  }
}
