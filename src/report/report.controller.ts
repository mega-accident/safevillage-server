import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  async createReport(@Body() data: CreateReportDto) {
    const report = await this.reportService.createReport(data);
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
