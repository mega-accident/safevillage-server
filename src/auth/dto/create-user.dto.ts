import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '채근영', description: '사용자 이름' })
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({ example: '010-1234-5678', description: '사용자 전화번호' })
  @IsString()
  @IsNotEmpty({ message: '전화번호를 입력해주세요.' })
  phone: string;

  @ApiProperty({ example: 'qwer1234*', description: '사용자 비밀번호' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;
}
