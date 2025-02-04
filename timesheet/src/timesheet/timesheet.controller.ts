import { Controller, Post, Get, Put, Body, Param, HttpStatus, HttpException, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateTimesheetDto, UpdateTimesheetDto } from './dto/timesheet.dto';

@ApiTags('Timesheet')
@Controller('timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  @ApiOperation({ summary: 'Add new timesheet entries' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Timesheet entries created successfully' })
  async addTimesheet(@Body() createTimesheetDto: CreateTimesheetDto) {
    return this.timesheetService.addTimesheet(createTimesheetDto);
  }

  @Get(':year')
  @ApiOperation({ summary: 'Get timesheet entries by year' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timesheet entries retrieved successfully' })
  @ApiParam({ name: 'year', type: 'number' })
  async getTimesheetByYear(
    @Param('year') year: string,
    @Query('costId') costId: string
  ): Promise<any> {
    if (!costId) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing required parameter: costId',
        details: 'Please provide a valid costId in the query parameters to fetch timesheet entries.'
      }, HttpStatus.BAD_REQUEST);
    }

    if (isNaN(parseInt(year)) || parseInt(year) < 2000 || parseInt(year) > 2100) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid year parameter',
        details: 'Please provide a valid year between 2000 and 2100.'
      }, HttpStatus.BAD_REQUEST);
    }

    return this.timesheetService.getTimesheetByYear(parseInt(year), costId);
  }

  @Put('/bulk-update')
  @ApiOperation({ summary: 'Bulk update timesheet entries' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timesheet entries updated successfully' })
  async bulkUpdateTimesheetDays(@Body() updates: UpdateTimesheetDto[]) {
    return this.timesheetService.bulkUpdateTimesheetDays(updates);
  }
}
