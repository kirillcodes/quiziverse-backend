import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import { ROLES } from 'src/users/enums/roles.enum';
import { UsersCourses } from 'src/users/users-courses.model';
import { Course } from 'src/courses/courses.model';

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
    @InjectModel(UsersCourses)
    private readonly userCourseModel: typeof UsersCourses,
    @InjectModel(Course)
    private readonly courseModel: typeof Course,
  ) {}

  async createTest(
    createTestDto: CreateTestDto,
    courseId: number,
    userId: number,
  ): Promise<Test | Error> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new UnauthorizedException('User was not found');
    }

    if (user.role !== ROLES.TEACHER) {
      throw new ForbiddenException('No permissions');
    }

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
      throw new UnauthorizedException('User was not found');
    }

    const tests = await this.testModel.findAll({
      where: { courseId: courseId },
    });

    if (user.role === ROLES.TEACHER) {
      const course = await this.userCourseModel.findOne({
        where: { userId, courseId },
      });
      if (course) {
        return tests;
      }
    }

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
      throw new UnauthorizedException('User was not found');
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
      throw new NotFoundException('Test was not found');
    }

    const testResult = this.testResultModel.findOne({
      where: { testId, userId },
    });

    if (testResult[0]) {
      throw new ForbiddenException('The test has already been passed');
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
      throw new UnauthorizedException('User was not found');
    }

    const test = await this.testModel.findOne({
      where: { id: testId, courseId },
      include: [
        { model: this.questionModel, include: [{ model: this.answerModel }] },
      ],
    });

    if (!test) {
      throw new NotFoundException('Test was not found');
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
      throw new ForbiddenException('The test has already been passed');
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

    return true;
  }

  async getResultsList(courseId: number, testId: number, userId: number) {
    const test = await this.testModel.findOne({
      where: { id: testId },
      include: [{ model: this.courseModel }],
    });

    if (!test) {
      throw new NotFoundException('Test was not found');
    }

    const course = test.course;
    if (course.authorId !== userId || course.id !== courseId) {
      throw new ForbiddenException('No permissions');
    }

    const testResults = await this.testResultModel.findAll({
      where: { testId },
      include: [
        {
          model: this.userModel,
        },
      ],
    });

    const questions = await this.questionModel.findAll({ where: { testId } });

    const globalScore = questions.reduce(
      (accumulator, currentQuesiton) => accumulator + currentQuesiton.points,
      0,
    );

    const formattedResults = testResults.map((result) => ({
      username: result.user.username,
      userId: result.user.id,
      globalScore,
      score: result.score,
      testResultId: result.id,
    }));

    return formattedResults;
  }

  async getUserResults(
    courseId: number,
    testId: number,
    studentId: number,
    userId: number,
  ) {
    const test = await this.testModel.findOne({
      where: { id: testId },
      include: [{ model: this.courseModel }],
    });

    if (!test) {
      throw new NotFoundException('Test was not found');
    }

    const course = test.course;
    if (course.authorId !== userId || course.id !== courseId) {
      throw new ForbiddenException('No permissions');
    }

    const testResults = await this.testResultModel.findOne({
      where: { testId, userId: studentId },
      include: [
        {
          model: this.testModel,
          include: [
            {
              model: this.questionModel,
              include: [{ model: this.answerModel }],
            },
          ],
        },
        { model: this.userAnswerModel },
      ],
    });

    if (!testResults) {
      return new NotFoundException('Test results was not found');
    }

    testResults.test.questions.reverse().forEach((question) => {
      question.answers.reverse();
    });

    const questions = await this.questionModel.findAll({ where: { testId } });
    const globalScore = questions.reduce(
      (accumulator, currentQuesiton) => accumulator + currentQuesiton.points,
      0,
    );

    const student = await this.userModel.findByPk(studentId);
    const studentData = {
      id: student.id,
      username: student.username,
      email: student.email,
    };

    const formattedResults = {
      id: testResults.id,
      score: testResults.score,
      globalScore,
      test: testResults.test,
      user: studentData,
      userAnswers: testResults.userAnswers,
    };

    return formattedResults;
  }

  async deleteTest(courseId: number, testId: number, userId: number) {
    const test = await this.testModel.findOne({
      where: { id: testId },
      include: [{ model: this.courseModel }],
    });

    if (!test) {
      throw new NotFoundException('Test was not found');
    }

    const course = test.course;
    if (course.authorId !== userId || course.id !== courseId) {
      throw new ForbiddenException('No permissions');
    }

    try {
      const testResults = await this.testResultModel.findAll({
        where: { testId },
      });
      const questions = await this.questionModel.findAll({ where: { testId } });

      await this.testResultModel.destroy({ where: { testId } });
      await this.testModel.destroy({ where: { id: testId } });
      await this.questionModel.destroy({ where: { testId } });

      for (const result of testResults) {
        await this.userAnswerModel.destroy({
          where: { testResultId: result.id },
        });
      }

      for (const question of questions) {
        await this.answerModel.destroy({
          where: { questionId: question.id },
        });
      }

      return true;
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
