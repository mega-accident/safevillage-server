import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  phone: string;
  name: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

// 리액트의 커스텀 훅과 비슷한 역할
export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    // ExecutionContext는 현재 실행 중인 요청에 대한 정보를 제공
    const req = ctx.switchToHttp().getRequest<RequestWithUser>(); // HTTP 요청 객체 가져오기
    return req.user;
  },
);
