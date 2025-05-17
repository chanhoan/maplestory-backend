import { BasicResponse } from './basic.response';

export class GetProfileResponse extends BasicResponse {
  username: string;
  email: string;
  profile: Record<string, any>;
}
