import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReportDto {
  @IsArray()
  @IsString({ each: true }) // 배열의 내부 요소 검사
  @IsNotEmpty({ message: '사진을 첨부해주세요.' })
  images: string[];

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '카테고리를 선택해주세요.' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: '상세 내용을 입력해주세요.' })
  description: string;

  @IsNumber()
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsNotEmpty({ message: '위도를 선택해주세요.' })
  lat: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: '경도를 선택해주세요.' })
  lon: number;

  @IsString()
  @IsNotEmpty({ message: '위험 정도를 선택해주세요.' })
  dangerDegree: string;

  @IsOptional()
  @IsBoolean()
  isDanger?: boolean;
}
