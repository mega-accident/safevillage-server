import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(data: CreateReportDto) {
    const isDanger = data.isDanger ?? data.dangerDegree === '최상';
    // ??는 null 병합 연산자이다. data.isDanger가 null 또는 undefined일 때 data.dangerDegree === '최상'을 할당한다
    try {
      const report = await this.prisma.report.create({
        data: {
          ...data,
          isDanger,
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
      where: { id: reportId },
      data: { dangerCount: { increment: 1 } }, // increment는 숫자 필드를 증가시키는 Prisma의 연산자
    });
    return report;
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
    return report;
  }
}
