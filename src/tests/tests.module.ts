import { Module } from '@nestjs/common';
import { TestController } from './tests.controller';
import { TestService } from './tests.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test } from './tests.model';
import { Question } from './questions.model';
import { Answer } from './answers.model';

@Module({
  imports: [SequelizeModule.forFeature([Test, Question, Answer])],
  controllers: [TestController],
  providers: [TestService]
})
export class TestsModule {}
