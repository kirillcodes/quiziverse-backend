import { Controller, Param, Delete, Post, Body, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Request } from 'express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('create-course')
  async createCourse(@Body() body: CreateCourseDto, @Req() req: Request): Promise<CreateCourseDto> {
    const { title, description } = body;

    const userId = req.user.id;

    const course = await this.coursesService.createCourse(title, description, userId);
    return course;
  }

  @Delete('delete-course/:id')
  async deleteCourse(@Param('id') id: string): Promise<void> {
    await this.coursesService.deleteCourse(+id);
  }
}
