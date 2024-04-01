import {
  Controller,
  Param,
  Delete,
  Post,
  Body,
  Req,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Request } from 'express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('create')
  async createCourse(@Body() body: CreateCourseDto, @Req() req: Request) {
    const { title, description } = body;

    const userId = req.user.id;

    const course = await this.coursesService.createCourse(
      title,
      description,
      userId,
    );
    return course;
  }

  @Delete('delete/:id')
  async deleteCourse(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user.id;

    await this.coursesService.deleteCourse(+id, userId);
  }

  @Get('signed')
  async getSignedCourses(@Req() req: Request) {
    const userId = req.user.id;

    return await this.coursesService.getCoursesByUserId(userId);
  }

  @Get('all')
  async getAllCourses() {
    return await this.coursesService.getAllCourses();
  }

  @Get(':id')
  async getCourseById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.coursesService.getCourseById(id, userId);
  }

  @Post(':id/subscribe')
  async subscribe(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = req.user.id;
    return await this.coursesService.subscribe(id, userId);
  }

  @Delete(':id/unsubscribe')
  async unsubscribe(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.coursesService.unsubscribe(id, userId);
  }
}
