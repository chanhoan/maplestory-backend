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

  /** 새 사용자 생성 */
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

  /** ID로 조회 (soft-delete 제외) */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** username으로 조회 (soft-delete 제외) */
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

  /** 역할 변경 */
  async updateRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** soft delete */
  async softDelete(username: string): Promise<void> {
    await this.userModel
      .findOneAndUpdate({ username }, { deletedAt: new Date() })
      .exec();
  }
}
