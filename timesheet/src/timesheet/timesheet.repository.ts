import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Timesheet, Prisma } from '@prisma/client';

@Injectable()
export class TimesheetRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TimesheetCreateInput): Promise<Timesheet> {
    return this.prisma.timesheet.create({ data });
  }

  async findByYear(year: number): Promise<Timesheet[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return this.prisma.timesheet.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  async findByDate(date: Date): Promise<Timesheet | null> {
    return this.prisma.timesheet.findFirst({
      where: { date }
    });
  }

  async update(id: string, data: Prisma.TimesheetUpdateInput): Promise<Timesheet> {
    return this.prisma.timesheet.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Timesheet> {
    return this.prisma.timesheet.delete({
      where: { id }
    });
  }
}
