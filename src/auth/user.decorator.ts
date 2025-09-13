import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 리액트의 커스텀 훅과 비슷한 역할
export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    // ExecutionContext는 현재 실행 중인 요청에 대한 정보를 제공
    const req = ctx.switchToHttp().getRequest(); // HTTP 요청 객체 가져오기
    return req.user;
  },
);
