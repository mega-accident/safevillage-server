import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
