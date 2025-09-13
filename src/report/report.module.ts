import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
