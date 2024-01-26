import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './courses.model';
import { UsersCourses } from 'src/users/users-courses.model';
import { User } from 'src/users/users.model';

@Module({
  providers: [CoursesService],
  controllers: [CoursesController],
  imports: [SequelizeModule.forFeature([Course, UsersCourses, User])]
})
export class CoursesModule {}
