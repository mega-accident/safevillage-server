// React의 PrivateRoute와 비슷한 역할

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService, // JWT 토큰 검증
    private reflector: Reflector, // 메타데이터 읽기
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // @Public() 데코레이터가 있으면 인증 생략
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]); // Public 데코레이터가 있는지 확인한다

    if (isPublic) {
      return true;
    } // Public이 true면 인증 생략

    // Authentication 헤더에서 토큰 추출
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    try {
      const payload = this.jwtService.verify(token);
      // 토큰이 유효하면 payload를 request에 담아 컨트롤러에서 사용할 수 있게 한다
      request.user = payload; // 검증된 사용자 정보를 payload에 저장
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return true;
  }

  // 토큰 추출 함수
  private extractTokenFromHeader(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
