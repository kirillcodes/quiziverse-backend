import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Test } from './tests.model';
import { Question } from './questions.model';
import { Answer } from './answers.model';
import { CreateTestDto } from './dto/create-test.dto';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(Test)
    private readonly testModel: typeof Test,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(Answer)
    private readonly answerModel: typeof Answer,
  ) {}

  async createTest(
    createTestDto: CreateTestDto,
    courseId: number,
  ): Promise<Test> {
    const { title, timeLimit, startDate, questions } = createTestDto;

    const test = await this.testModel.create({
      title,
      timeLimit,
      startDate,
      courseId,
    });

    const questionsData = questions.map(questionDto => ({
      rightAnswer: questionDto.rightAnswer,
      points: questionDto.points,
      testId: test.id,
    }));

    const createdQuestions = await this.questionModel.bulkCreate(questionsData);

    const answersData = [];
    for (let i = 0; i < questions.length; i++) {
      const answers = questions[i].answers.map(answerDto => ({
        text: answerDto.text,
        questionId: createdQuestions[i].id,
      }));
      answersData.push(...answers);
    }

    await this.answerModel.bulkCreate(answersData);

    return test;
  }
}
