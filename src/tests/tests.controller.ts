import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { TestService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';

@Controller('courses/:courseId/tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createTestDto: CreateTestDto,
  ) {
    return await this.testService.createTest(createTestDto, courseId);
  }

  @Get()
  async getTestsList(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.testService.getTestsList(courseId);
  }

  @Get(':id')
  async getTest(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.testService.getTest(courseId, id);
  }
}
