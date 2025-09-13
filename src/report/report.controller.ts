import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/user.decorator';

@Controller('reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      fileFilter: (_, file, callback) => {
        const fileName = file.originalname.toLowerCase();
        const allowedExtensions = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.webp',
          '.heic',
          '.heif',
        ];

        // 확장자 확인
        const hasValidExtension = allowedExtensions.some((ext) =>
          fileName.endsWith(ext),
        );
        if (!hasValidExtension) {
          return callback(
            new BadRequestException(
              '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP, HEIC)',
            ),
            false,
          );
        }

        // MIME 타입 확인
        const isImageMimeType = file.mimetype.startsWith('image/');
        const isHeicWithOctetStream =
          fileName.endsWith('.heic') &&
          file.mimetype === 'application/octet-stream';
        // HEIC/HEIF 파일은 octet-stream도 허용
        // octet-stream은 일반적으로 바이너리 파일에 사용되는 MIME 타입
        if (!isImageMimeType && !isHeicWithOctetStream) {
          return callback(
            new Error(
              '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP, HEIC)',
            ),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async createReport(
    @Body() data: CreateReportDto,
    @User() user: { sub: number },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const report = await this.reportService.createReport(data, user, files);
    return {
      success: true,
      data: report,
    };
  }

  @Get()
  async getReports() {
    const reports = await this.reportService.getReports();
    return {
      success: true,
      data: reports,
    };
  }

  @Get(':id')
  async getReportById(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportService.getReportById(id);
    return {
      success: true,
      data: report,
    };
  }

  @Post(':id/danger')
  async createDanger(@Param('id', ParseIntPipe) reportId: number) {
    const report = await this.reportService.createDanger(reportId);
    return {
      success: true,
      data: report,
    };
  }

  @Delete(':id/danger')
  async deleteDanger(@Param('id', ParseIntPipe) reportId: number) {
    const report = await this.reportService.deleteDanger(reportId);
    return {
      success: true,
      data: report,
    };
  }
}
