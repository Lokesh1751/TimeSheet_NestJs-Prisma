import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimesheetModule } from './timesheet/timesheet.module';
import { TimesheetController } from './timesheet/timesheet.controller';
import { TimesheetService } from './timesheet/timesheet.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule, TimesheetModule],
  controllers: [AppController, TimesheetController],
  providers: [AppService, TimesheetService],
})
export class AppModule {}

