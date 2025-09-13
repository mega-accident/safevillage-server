import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/user.decorator';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  private async _updateIsDanger(report: {
    // _는 private 메서드임을 나타낸다, private 메서드는 클래스 외부에서 접근 불가능하다
    id: number;
    dangerCount: number;
    isDanger: boolean;
  }) {
    const newIsDanger = report.dangerCount >= 5;
    if (report.isDanger !== newIsDanger) {
      return this.prisma.report.update({
        where: { id: report.id },
        data: { isDanger: newIsDanger },
      });
    }
    return report;
  }

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
      where: { id: reportId },
      data: { dangerCount: { increment: 1 } }, // increment는 숫자 필드를 증가시키는 Prisma의 연산자
    });
    return this._updateIsDanger(report);
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
    return this._updateIsDanger(report);
  }
}
