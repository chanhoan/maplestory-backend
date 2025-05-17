import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.shema';
import { UserRole } from './user.role';

@Injectable()
export class UserRepository {
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
      deletedAt: null,
    });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username, deletedAt: null }).exec();
  }

  async findByUsernameAndUpdate(
    username: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return await this.userModel
      .findOneAndUpdate({ username }, data, { new: true, runValidators: true })
      .exec();
  }

  async updateRole(username: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { username },
        { role },
        { new: true, runValidators: true },
      )
      .exec();
    if (!user) throw new NotFoundException(`User ${username} not found`);
    return user;
  }

  async softDelete(username: string): Promise<void> {
    await this.userModel
      .findOneAndUpdate({ username }, { deletedAt: new Date() })
      .exec();
  }

  async restoreByUsername(username: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { username },
      { deletedAt: null },
      { new: true, runValidators: true },
    );
  }
}
