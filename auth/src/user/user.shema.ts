import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user.role';
import { UserStatus } from './user.status';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
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

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status: UserStatus;

  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
