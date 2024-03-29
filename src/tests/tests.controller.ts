import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  Req,
  Delete,
} from '@nestjs/common';
import { TestService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { ResultsDto } from './dto/results.dto';

@Controller('courses/:courseId/tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
    @Body() createTestDto: CreateTestDto,
  ) {
    const userId = req.user.id;
    return await this.testService.createTest(createTestDto, courseId, userId);
  }

  @Get()
  async getTestsList(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.testService.getTestsList(courseId, userId);
  }

  @Get(':id')
  async getTest(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.testService.getTest(courseId, id, userId);
  }

  @Post(':id')
  async submitResult(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() resultsDto: ResultsDto,
  ) {
    const userId = req.user.id;
    return await this.testService.submitResults(
      courseId,
      id,
      userId,
      resultsDto,
    );
  }

  @Get(':id/results')
  async getResultsList(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) testId: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    const resultsList = await this.testService.getResultsList(
      courseId,
      testId,
      userId,
    );
    return resultsList;
  }

  @Get(':id/results/:studentId')
  async getUserResults(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) testId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    const userResults = await this.testService.getUserResults(
      courseId,
      testId,
      studentId,
      userId,
    );
    return userResults;
  }

  @Delete(':id/delete')
  async deleteTest(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) testId: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.testService.deleteTest(courseId, testId, userId);
  }
}
