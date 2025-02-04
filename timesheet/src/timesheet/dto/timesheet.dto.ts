import { ApiProperty } from '@nestjs/swagger';
import { DayType } from '@prisma/client';
import { IsString, IsArray, ValidateNested, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class TimesheetDayDto {
  @ApiProperty({ description: 'Date for the timesheet entry' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: DayType, description: 'Type of day (working, sick, vacation)' })
  @IsEnum(DayType)
  dayType: DayType;

  @ApiProperty({ description: 'Number of working hours', example: 8 })
  @IsNumber()
  workingHours: number;
}

export class CreateTimesheetDto {
  @ApiProperty({ description: 'Cost ID for the timesheet entries' })
  @IsString()
  costId: string;

  @ApiProperty({ 
    type: [TimesheetDayDto], 
    description: 'Array of timesheet day entries',
    example: [
      { date: '2024-01-01', dayType: 'working', workingHours: 8 },
      { date: '2024-01-02', dayType: 'vacation', workingHours: 0 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetDayDto)
  days: TimesheetDayDto[];
}

export class UpdateTimesheetDto {
  @ApiProperty({ required: true, description: 'Date to update' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: DayType, required: false })
  @IsEnum(DayType)
  day_type?: DayType;

  @ApiProperty({ required: false })
  @IsNumber()
  workingHours?: number;
} 