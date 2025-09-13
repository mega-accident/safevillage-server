import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    example: '대구소프트웨어마이스터고 앞 보도블록이 파손되었습니다.',
    description: '신고 제목',
  })
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiProperty({ example: '도로안전', description: '신고 카테고리' })
  @IsString()
  @IsNotEmpty({ message: '카테고리를 선택해주세요.' })
  category: string;

  @ApiProperty({
    example:
      '대구소프트웨어마이스터고등학교 앞 보도블록이 파손되었습니다. 빠른 조치 부탁드립니다.',
    description: '신고 상세 내용',
  })
  @IsString()
  @IsNotEmpty({ message: '상세 내용을 입력해주세요.' })
  description: string;

  @ApiProperty({ example: 37.123456, description: '위도' })
  @IsNumber()
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsNotEmpty({ message: '위도를 선택해주세요.' })
  lat: number;

  @ApiProperty({ example: 127.123456, description: '경도' })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: '경도를 선택해주세요.' })
  lon: number;

  @ApiProperty({ example: '높음', description: '위험 정도' })
  @IsString()
  @IsNotEmpty({ message: '위험 정도를 선택해주세요.' })
  dangerDegree: string;

  @IsOptional()
  @IsBoolean()
  isDanger?: boolean;
}
