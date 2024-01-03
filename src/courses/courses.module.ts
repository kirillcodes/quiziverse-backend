import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './courses.model';
import { UserCourse } from 'src/users/user-course.model';
import { User } from 'src/users/users.model';

@Module({
  providers: [CoursesService],
  controllers: [CoursesController],
  imports: [SequelizeModule.forFeature([Course, UserCourse, User])]
})
export class CoursesModule {}
