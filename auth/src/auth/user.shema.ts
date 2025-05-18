import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user.role';

export type UserDocument = User & Document;

/**
 * 사용자 정보 도메인 모델 (users 컬렉션)
 */
@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  /**
   * 로그인에 사용할 고유한 사용자명
   * - 반드시 4자 이상
   * - 영문·숫자만 허용
   */
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
    index: true,
  })
  role: UserRole;

  /**
   * 사용자 프로필 정보
   * - nickname: string
   * - phone: string
   * - address?: string
   */
  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;

  @Prop({ type: Date, index: true })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
