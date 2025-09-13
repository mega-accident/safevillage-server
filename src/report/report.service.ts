import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/user.decorator';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(data: CreateReportDto, @User() user: { sub: number }) {
    const isDanger = data.isDanger ?? data.dangerDegree === '최상';
    // ??는 null 병합 연산자이다. data.isDanger가 null 또는 undefined일 때 data.dangerDegree === '최상'을 할당한다

    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    if (!existingUser) {
      throw new HttpException(
        {
          success: false,
          message: '유효하지 않은 사용자입니다.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const report = await this.prisma.report.create({
        data: {
          ...data,
          isDanger,
          userId: user.sub,
        },
      });
      return report;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST, // 클라이언트 측 요청 형식이 잘못됨
      );
    }
  }

  async getReports() {
    return this.prisma.report.findMany(); // findMany는 모든 레코드를 반환
  }

  async getReportById(id: number) {
    return this.prisma.report.findUnique({
      where: { id },
      // findUnique + where는 고유한 값을 찾을 때 사용
    });
  }

  async createDanger(reportId: number) {
    const report = await this.prisma.report.update({
      where: { id: reportId, dangerCount: { gt: 0 } }, // gt는 greater than, 여기선 0보다 큰 값
      data: { dangerCount: { increment: 1 } }, // increment는 숫자 필드를 증가시키는 Prisma의 연산자
    });

    // dangerCount >= 5일 때 isDanger를 true로 업데이트
    const newIsDanger = report.dangerCount >= 5;
    if (report.isDanger === newIsDanger) return report; // 변경사항이 없으면 그대로 반환
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isDanger: newIsDanger },
    }); // 변경사항이 있으면 업데이트된 report 반환
  }

  async deleteDanger(reportId: number) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        dangerCount: {
          decrement: 1, // decrement는 숫자 감소
        },
      },
    });

    const newIsDanger = report.dangerCount >= 5;
    if (report.isDanger === newIsDanger) return report;
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isDanger: newIsDanger },
    });
  }
}
