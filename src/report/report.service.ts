import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportsService {
  private s3Client: S3Client;
  private configService: ConfigService;

  constructor(private prisma: PrismaService) {
    const awsRegion = this.configService.get('AWS_REGION');
    const awsAccessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS 환경 변수가 설정되지 않았습니다.');
    }
    // S3Client 초기화
    this.s3Client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });
  }

  // S3에 파일을 업로드하는 메서드
  async uploadToS3(file: Express.Multer.File): Promise<string> {
    const awsS3Bucket = this.configService.get('AWS_S3_BUCKET');
    const awsRegion = this.configService.get('AWS_REGION');

    if (!awsS3Bucket) {
      throw new Error(
        'S3 버킷 이름이 설정되지 않았습니다. .env 파일을 확인하세요.',
      );
    }

    // 파일 이름을 고유하게 생성 (Controller에서 이미 검증됨)
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const fileName = `reports/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;

    // S3에 파일 업로드
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    // S3에 파일 업로드 실행
    await this.s3Client.send(command);
    // 업로드된 파일의 URL 반환
    return `https://${awsS3Bucket}.s3.${awsRegion}.amazonaws.com/${fileName}`;
  }

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

  async createReport(
    data: CreateReportDto,
    user: { sub: number },
    files?: Express.Multer.File[], // Multer는 파일 업로드를 처리하는 미들웨어
  ) {
    if (!files || files.length < 1) {
      throw new HttpException(
        {
          success: false,
          message: '사진은 1개 이상 첨부해주세요.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 이미지 파일 S3에 업로드
    const imageUrls = await Promise.all(
      // Promise.all은 모든 비동기 작업이 완료될 때까지 기다림
      files.map((file) => this.uploadToS3(file)),
    );

    const isDanger = data.isDanger ?? data.dangerDegree === '최상';
    // ??는 null 병합 연산자이다. data.isDanger가 null 또는 undefined일 때 data.dangerDegree === '최상'을 할당한다

    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    if (!existingUser) {
      throw new NotFoundException('유효하지 않은 사용자입니다.'); // NotFound -> 404, 리소스를 찾을 수 없음
    }

    try {
      const report = await this.prisma.report.create({
        data: {
          title: data.title,
          category: data.category,
          description: data.description,
          lat: data.lat, // 이미 number 타입으로 변환됨
          lon: data.lon, // 이미 number 타입으로 변환됨
          dangerDegree: data.dangerDegree,
          isDanger,
          images: imageUrls, // S3에 업로드된 이미지 URL들
          userId: user.sub,
        },
      });
      return report;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          // instanceof는 객체가 특정 클래스의 인스턴스인지 확인하는 연산자
          // error가 Error 클래스의 인스턴스이면 error.message를 반환, 아니면 'Unknown error' 반환
        },
        HttpStatus.BAD_REQUEST, // 클라이언트 측 요청 형식이 잘못됨
      );
    }
  }

  async getReports() {
    return this.prisma.report.findMany(); // findMany는 모든 레코드를 반환
  }

  async getReportById(id: number) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      // findUnique + where는 고유한 값을 찾을 때 사용
    });
    if (!report) throw new NotFoundException('신고를 찾을 수 없습니다.');
    return report;
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
