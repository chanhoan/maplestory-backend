import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @IsString()
  @IsNotEmpty({ message: 'username은 필수 항목입니다.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password은 필수 항목입니다.' })
  password: string;
}
