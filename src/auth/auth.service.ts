import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable() // 의존성 주입 가능한 서비스
export class AuthService {
  constructor(private prisma: PrismaService) {} // DB 접근

  async createUser(data: CreateUserDto): Promise<User> {
    // Promise<User>는 비동기적으로 User 객체를 반환함을 의미
    try {
      const user = await this.prisma.user.create({
        // create는 nest가 제공하는 메서드
        data,
      });
      return user;
    } catch (error) {
      throw new HttpException(
        `회원가입 실패, ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
