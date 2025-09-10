import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable() // 의존성 주입 가능한 서비스
export class AuthService {
  constructor(
    private prisma: PrismaService, // DB 접근
    private jwtService: JwtService,
  ) {}

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

  async signin(data: SignInUserDto) {
    const user = await this.prisma.user.findUnique({
      // findUnique는 고유한 값을 찾을 때 사용
      where: { phone: data.phone, password: data.password },
    });
    if (user) {
      const payload = { phone: user.phone, name: user.name }; // JWT에 담길 정보
      const accessToken = this.jwtService.sign(payload); // JWT 토큰 생성
      return accessToken;
    } else {
      throw new HttpException(
        {
          success: false,
          message: '로그인 실패, 아이디 또는 비밀번호를 확인하세요.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
