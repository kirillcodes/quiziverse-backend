import { Module } from '@nestjs/common';
import { TestController } from './tests.controller';
import { TestService } from './tests.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test } from './tests.model';
import { Question } from './questions.model';
import { Answer } from './answers.model';
import { User } from 'src/users/users.model';
import { TestResult } from 'src/tests/tests-results.model';
import { UserAnswer } from './users-answers.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Test,
      Question,
      Answer,
      TestResult,
      UserAnswer,
      User,
    ]),
  ],
  controllers: [TestController],
  providers: [TestService],
})
export class TestsModule {}
