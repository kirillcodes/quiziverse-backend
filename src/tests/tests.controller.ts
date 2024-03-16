import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TestService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';

@Controller('courses/:courseId/tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(
    @Param('courseId') courseId: number,
    @Body() createTestDto: CreateTestDto,
  ) {
    return await this.testService.createTest(createTestDto, courseId);
  }

  @Get()
  async get(@Param('courseId') courseId: number) {
    return await this.testService.getTestsList(courseId);
  }
}
