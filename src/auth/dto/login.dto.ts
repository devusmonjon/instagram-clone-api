import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
