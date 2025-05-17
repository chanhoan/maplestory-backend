// src/auth/user.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.shema';
import { UserRole } from './user.role';
import { UserStatus } from './user.status';

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
      status: UserStatus.ACTIVE,
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

  /** email으로 조회 (soft-delete 제외) */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: null }).exec();
  }

  /** 전체 조회 (deleted 제외 or 포함) */
  async findAll(options?: {
    includeDeleted?: boolean;
  }): Promise<UserDocument[]> {
    const filter: any = {};
    if (!options?.includeDeleted) filter.deletedAt = null;
    return this.userModel.find(filter).exec();
  }

  /** 계정 상태 변경 */
  async updateStatus(id: string, status: UserStatus): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** 역할 변경 */
  async updateRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** soft delete */
  async softDelete(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  /** hard delete */
  async hardDelete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
