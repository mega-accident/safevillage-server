import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable() // 의존성 주입 가능한 서비스
export class AuthService {
  constructor(
    private prisma: PrismaService, // DB 접근
    private jwtService: JwtService,
  ) {}

  async createUser(data: CreateUserDto) {
    // Promise<User>는 비동기적으로 User 객체를 반환함을 의미
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await this.prisma.user.create({
        // create는 nest가 제공하는 메서드
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      return;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async signin(data: SignInUserDto) {
    const user = await this.prisma.user.findUnique({
      // findUnique는 고유한 값을 찾을 때 사용
      where: { phone: data.phone },
    });

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.'); // Unauthorized -> 401, 인증 실패
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    // bcrypt.compare는 해시된 비밀번호와 원래 비밀번호를 비교

    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.');
    }

    const payload = { sub: user.id, phone: user.phone, name: user.name }; // JWT에 담길 정보, sub는 subject의 약자, 토큰의 주체를 나타낸다
    const accessToken = this.jwtService.sign(payload); // JWT 토큰 생성
    return accessToken;
  }

  async getMyInfo(userID: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userID },
      include: {
        reports: true, // 사용자의 신고들도 함께 조회
      },
    });

    if (!user) throw new UnauthorizedException('유저 정보가 없습니다.');

    const { password, ...result } = user; // password를 제외한 나머지 정보만 반환
    return result;
  }
}
