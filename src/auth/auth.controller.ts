import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { Public } from './public.decorator';
import { User } from './user.decorator';

@Controller('auth') // 기본 경로 /auth
export class AuthController {
  constructor(private authService: AuthService) {} // 의존성 주입
  // AuthService는 사용자 생성 로직을 담당
  // constructor는 클래스가 인스턴스화될 때 호출되는 메서드, 여기서는 authService를 주입받음

  @Public() // Public 데코레이터를 사용하면 인증을 생략한다
  @Post('signup') // POST, /auth/signup
  async createUser(@Body() data: CreateUserDto) {
    // form데이터 처리와 비슷하다. @Body에 담긴 데이터를 data로 받는다.
    const user = await this.authService.createUser(data);
    // authService의 createUser 메서드를 호출하여 사용자 생성
    return {
      success: true,
      data: user,
    };
  }

  @Public()
  @Post('signin')
  async signin(@Body() data: SignInUserDto) {
    try {
      const accessToken = await this.authService.signin(data);
      return {
        success: true,
        accessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '로그인 실패, 아이디 또는 비밀번호를 확인하세요.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('my')
  async getMyInfo(@User() user: { sub: number }) {
    const userInfo = await this.authService.getMyInfo(user.sub);
    return {
      success: true,
      data: userInfo,
    };
  }
}
