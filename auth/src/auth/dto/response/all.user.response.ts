import { UserRole } from '../../../user/user.role';
import { BasicResponse } from './basic.response';

export class AllUserResponse extends BasicResponse {
  users: UserDto[];
}

export class UserDto {
  username: string;
  email: string;
  role: UserRole;
  profile: Record<string, any>;
}
