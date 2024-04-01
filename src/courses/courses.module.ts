import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './courses.model';
import { UsersCourses } from 'src/users/users-courses.model';
import { User } from 'src/users/users.model';
import { Test } from 'src/tests/tests.model';
import { Question } from 'src/tests/questions.model';
import { UserAnswer } from 'src/tests/users-answers.model';
import { Answer } from 'src/tests/answers.model';
import { TestResult } from 'src/tests/tests-results.model';

@Module({
  providers: [CoursesService],
  controllers: [CoursesController],
  imports: [
    SequelizeModule.forFeature([
      Course,
      UsersCourses,
      User,
      Test,
      Question,
      Answer,
      UserAnswer,
      TestResult,
    ]),
  ],
})
export class CoursesModule {}
