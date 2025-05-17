import { BasicResponse } from './basic.response';

export class LoginResponse extends BasicResponse {
  username: string;
  accessToken: string;
}
