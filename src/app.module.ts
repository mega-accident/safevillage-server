import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { ReportModule } from './report/report.module';

@Module({
  imports: [AuthModule, PrismaModule, ReportModule],
  controllers: [AppController, ReportController],
  providers: [AppService, ReportService],
})
export class AppModule {}
