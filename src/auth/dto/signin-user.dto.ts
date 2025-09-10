import { IsString } from 'class-validator';

export class SignInUserDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}
