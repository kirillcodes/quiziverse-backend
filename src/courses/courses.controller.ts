import {
  Controller,
  Param,
  Delete,
  Post,
  Body,
  Req,
  Get,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Put,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';

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

  @Delete(':id/delete')
  async deleteCourse(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return await this.coursesService.deleteCourse(id, userId);
  }

  @Get('signed')
  async getSignedCourses(@Req() req: Request) {
    const userId = req.user.id;
    return await this.coursesService.getCoursesByUserId(userId);
  }

  @UseGuards(ThrottlerGuard)
  @Get('search')
  async searchCourses(@Query('query') query: string, @Req() req: Request) {
    const userId = req.user.id;
    const courses = await this.coursesService.search(query, userId);
    return courses;
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

  @Put(':id/upload-cover')
  @UseInterceptors(FileInterceptor('image'))
  async setCoverToCourse(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|gif|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const base64Image = file.buffer.toString('base64');
    return await this.coursesService.setCoverToCourse(base64Image, id, userId);
  }
}
