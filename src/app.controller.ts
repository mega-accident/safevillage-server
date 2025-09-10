import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  home(): string {
    return '안전마을 API에 오신 것을 환영합니다!';
  }
}
