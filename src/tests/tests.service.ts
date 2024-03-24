import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Test } from './tests.model';
import { Question } from './questions.model';
import { Answer } from './answers.model';
import { CreateTestDto } from './dto/create-test.dto';
import { User } from 'src/users/users.model';
import { TestResult } from 'src/tests/tests-results.model';
import { UserAnswer } from './users-answers.model';
import { ResultsDto } from './dto/results.dto';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserAnswer)
    private readonly userAnswerModel: typeof UserAnswer,
    @InjectModel(Test)
    private readonly testModel: typeof Test,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(Answer)
    private readonly answerModel: typeof Answer,
    @InjectModel(TestResult)
    private readonly testResultModel: typeof TestResult,
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

    const questionsData = questions.map((QuestionDto) => ({
      text: QuestionDto.text,
      rightAnswer: QuestionDto.rightAnswer,
      points: QuestionDto.points,
      testId: test.id,
    }));

    const createdQuestions = await this.questionModel.bulkCreate(questionsData);

    const answersData = [];
    for (let i = 0; i < questions.length; i++) {
      const answers = questions[i].answers.map((AnswerDto) => ({
        text: AnswerDto.text,
        questionId: createdQuestions[i].id,
      }));
      answersData.push(...answers);
    }

    await this.answerModel.bulkCreate(answersData);

    return test;
  }

  async getTestsList(courseId: number, userId: number) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return new UnauthorizedException('You are not authorized');
    }

    const tests = await this.testModel.findAll({
      where: { courseId: courseId },
    });

    const testsResults = await this.testResultModel.findAll({
      where: { userId },
    });

    const passedTestsIds = testsResults.map((result) => result.testId);

    const filteredTests = tests.filter(
      (test) => !passedTestsIds.includes(test.id),
    );

    return filteredTests;
  }

  async getTest(courseId: number, testId: number, userId: number) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return new UnauthorizedException('You are not authorized');
    }

    const test = await this.testModel.findOne({
      where: { id: testId, courseId: courseId },
      include: [
        {
          model: this.questionModel,
          include: [{ model: this.answerModel }],
        },
      ],
    });

    if (!test) {
      return new NotFoundException('Test was not found');
    }

    const testResult = this.testResultModel.findOne({
      where: { testId, userId },
    });

    if (testResult) {
      return new ForbiddenException('The test has already been passed');
    }

    const formattedTest = {
      id: test.id,
      title: test.title,
      timeLimit: test.timeLimit,
      startDate: test.startDate,
      questions: test.questions.map((question) => ({
        id: question.id,
        text: question.text,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          text: answer.text,
        })),
      })),
    };

    return formattedTest;
  }

  async submitResults(
    courseId: number,
    testId: number,
    userId: number,
    data: ResultsDto,
  ) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return new UnauthorizedException('You are not authorized');
    }

    const test = await this.testModel.findOne({
      where: { id: testId, courseId },
      include: [
        { model: this.questionModel, include: [{ model: this.answerModel }] },
      ],
    });

    if (!test) {
      return new NotFoundException('Test was not found');
    }

    let score = 0;
    test.questions.forEach(({ id, rightAnswer, points }) => {
      if (id in data) {
        data[id] === rightAnswer ? (score += points) : null;
      }
    });

    let testResult = await this.testResultModel.findOne({
      where: { testId, userId },
    });

    if (testResult) {
      return new ForbiddenException('The test has already been passed');
    }

    testResult = await this.testResultModel.create({
      testId,
      userId,
      score,
    });

    for (const [questionId, chosenAnswerId] of Object.entries(data)) {
      await this.userAnswerModel.create({
        questionId: +questionId,
        chosenAnswerId,
        testResultId: testResult.id,
      });
    }
  }
}
