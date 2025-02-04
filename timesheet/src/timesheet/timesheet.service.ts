import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Timesheet, Prisma, DayType } from '@prisma/client';
import { CreateTimesheetDto } from './dto/timesheet.dto';

@Injectable()
export class TimesheetService {
  constructor(private prisma: PrismaService) {}

  async addTimesheet(data: CreateTimesheetDto): Promise<any> {
    const timesheets: Timesheet[] = [];
    let totalVacation = 0;
    let totalSick = 0;
    let totalWorkingHours = 0;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.costId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid UUID format for costId',
          details: {
            error: 'UUID Validation Failed',
            providedValue: data.costId,
            expectedFormat:
              'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (where x is any hexadecimal digit and y is one of 8, 9, a, or b)',
            example: '123e4567-e89b-12d3-a456-426614174000',
            help: 'Please ensure the costId is a valid UUID v4 format. Only hexadecimal characters (0-9, a-f) are allowed.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const day of data.days) {
      const entryDate = new Date(day.date);
      entryDate.setHours(0, 0, 0, 0);

      // Validate date format
      if (isNaN(entryDate.getTime())) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid date format',
            details: {
              error: 'Date Validation Failed',
              providedValue: day.date,
              expectedFormat: 'YYYY-MM-DD',
              example: '2024-03-01',
              help: 'Please ensure all dates are in ISO format (YYYY-MM-DD)',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Working Hours Validation
      if (day.dayType === 'sick' && day.workingHours > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid working hours for sick leave',
            details: {
              error: 'Working Hours Validation Failed',
              date: day.date,
              dayType: day.dayType,
              providedHours: day.workingHours,
              expectedHours: 0,
              help: 'Sick leave days must have 0 working hours. Please set workingHours to 0 for all sick leave entries.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (day.dayType === 'vacation' && day.workingHours > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid working hours for vacation',
            details: {
              error: 'Working Hours Validation Failed',
              date: day.date,
              dayType: day.dayType,
              providedHours: day.workingHours,
              expectedHours: 0,
              help: 'Vacation days must have 0 working hours. Please set workingHours to 0 for all vacation entries.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (day.dayType === 'working' && day.workingHours === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid working hours for working day',
            details: {
              error: 'Working Hours Validation Failed',
              date: day.date,
              dayType: day.dayType,
              providedHours: day.workingHours,
              minimumExpectedHours: 1,
              help: 'Working days must have working hours greater than 0. Please provide valid working hours for working days.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (day.workingHours < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Negative working hours not allowed',
            details: {
              error: 'Working Hours Validation Failed',
              date: day.date,
              providedHours: day.workingHours,
              help: 'Working hours cannot be negative. Please provide 0 or positive values only.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        const timesheet = await this.prisma.timesheet.create({
          data: {
            costId: data.costId,
            date: new Date(day.date),
            workingHours: day.workingHours,
            day_type: day.dayType as DayType,
          },
        });

        if (timesheet.day_type === 'vacation') totalVacation++;
        if (timesheet.day_type === 'sick') totalSick++;
        if (timesheet.day_type === 'working')
          totalWorkingHours += timesheet.workingHours;

        timesheets.push(timesheet);
      } catch (error) {
        if (error.code === 'P2002') {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'Duplicate entry found',
              details: {
                error: 'Unique Constraint Violation',
                date: day.date,
                help: 'A timesheet entry already exists for this date. Each date can only have one timesheet entry.',
              },
            },
            HttpStatus.CONFLICT,
          );
        }
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Failed to create timesheet entry',
            details: {
              error: error.message,
              help: 'Please check your input data and try again.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Timesheet entries created successfully',
      data: {
        summary: {
          total_entries: timesheets.length,
          total_vacation_leaves: totalVacation,
          total_sick_leaves: totalSick,
          total_working_hours: totalWorkingHours,
        },
        days: timesheets,
      },
    };
  }

  async getTimesheetByYear(year: number, costId: string): Promise<any> {
    const timesheets = await this.prisma.timesheet.findMany({
      where: {
        date: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
        costId: costId,
      },
    });

    if (!timesheets.length) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No timesheet entries found for year ${year} and costId ${costId}`,
        details:
          'Please verify the year and costId provided, or create new timesheet entries for this period.',
      });
    }

    const totalVacation = timesheets.filter(
      (t) => t.day_type === 'vacation',
    ).length;
    const totalSick = timesheets.filter((t) => t.day_type === 'sick').length;
    const totalWorkingHours = timesheets
      .filter((t) => t.day_type === 'working')
      .reduce((sum, t) => sum + t.workingHours, 0);

    // Create an array of all months
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Initialize monthly data structure with all months
    const monthlyData = monthNames.reduce((acc, month) => {
      acc[month] = {
        total_vacation_leaves: 0,
        total_sick_leaves: 0,
        total_working_hours: 0,
        days: [],
      };
      return acc;
    }, {});

    // Populate the monthly data
    timesheets.forEach((timesheet) => {
      const month = timesheet.date.toLocaleString('default', { month: 'long' });

      if (timesheet.day_type === 'vacation')
        monthlyData[month].total_vacation_leaves++;
      if (timesheet.day_type === 'sick') monthlyData[month].total_sick_leaves++;
      if (timesheet.day_type === 'working')
        monthlyData[month].total_working_hours += timesheet.workingHours;

      monthlyData[month].days.push(timesheet);
    });

    // Sort days within each month
    for (const month of monthNames) {
      monthlyData[month].days.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );
    }

    // Create the final response with only months that have data
    const months = monthNames.reduce((acc, month) => {
      if (monthlyData[month].days.length > 0) {
        acc[month] = monthlyData[month];
      }
      return acc;
    }, {});

    return {
      statusCode: HttpStatus.OK,
      message: `Timesheet for year ${year} fetched successfully`,
      data: {
        year,
        total_vacation_leaves: totalVacation,
        total_sick_leaves: totalSick,
        total_working_hours: totalWorkingHours,
        months,
      },
    };
  }

  async bulkUpdateTimesheetDays(updates: any[]): Promise<any> {
    const updatedTimesheets: Timesheet[] = [];

    for (const update of updates) {
      if (update.dayType === 'sick' && update.workingHours > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Cannot update timesheet for ${update.date}: Sick leave cannot have working hours.`,
            details:
              'When updating to sick leave, please set working hours to 0.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (update.dayType === 'vacation' && update.workingHours > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Cannot update timesheet for ${update.date}: Vacation days cannot have working hours.`,
            details:
              'When updating to vacation, please set working hours to 0.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (update.dayType === 'working' && update.workingHours === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Cannot update timesheet for ${update.date}: Working days must have working hours.`,
            details:
              'When updating to a working day, please specify working hours greater than 0.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const timesheet = await this.prisma.timesheet.findFirst({
        where: { date: new Date(update.date) },
      });

      if (!timesheet) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `No timesheet entry found for date ${update.date}`,
          details:
            'Please verify the date or create a new timesheet entry for this date.',
        });
      }

      const updatedTimesheet = await this.prisma.timesheet.update({
        where: { id: timesheet.id },
        data: {
          day_type: update.dayType as DayType,
          workingHours: update.workingHours,
        },
      });

      updatedTimesheets.push(updatedTimesheet);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Timesheet days updated successfully',
      data: updatedTimesheets,
    };
  }

  async create(data: Prisma.TimesheetCreateInput): Promise<Timesheet> {
    return this.prisma.timesheet.create({ data });
  }

  async findAll(): Promise<Timesheet[]> {
    return this.prisma.timesheet.findMany();
  }

  async findOne(id: string): Promise<Timesheet | null> {
    return this.prisma.timesheet.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.TimesheetUpdateInput,
  ): Promise<Timesheet> {
    return this.prisma.timesheet.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Timesheet> {
    return this.prisma.timesheet.delete({
      where: { id },
    });
  }

  async deleteTimesheetByyear(year: number): Promise<Prisma.BatchPayload> {
    return this.prisma.timesheet.deleteMany({
      where: {
        date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
      },
    });
  }
}
