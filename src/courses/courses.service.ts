import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Course } from './courses.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { ROLES } from 'src/users/enums/roles.enum';
import { UsersCourses } from 'src/users/users-courses.model';
import { Test } from 'src/tests/tests.model';
import { TestResult } from 'src/tests/tests-results.model';
import { Question } from 'src/tests/questions.model';
import { Answer } from 'src/tests/answers.model';
import { UserAnswer } from 'src/tests/users-answers.model';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course) private courseRepository: typeof Course,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UsersCourses)
    private userCourseRepository: typeof UsersCourses,
    @InjectModel(Test) private testRepository: typeof Test,
    @InjectModel(TestResult) private testResultRepository: typeof TestResult,
    @InjectModel(Question) private quesitonRepository: typeof Question,
    @InjectModel(Answer) private answerRepository: typeof Answer,
    @InjectModel(UserAnswer) private userAnswerRepository: typeof UserAnswer,
  ) {}

  async createCourse(title: string, description: string, userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== ROLES.TEACHER) {
      throw new ForbiddenException('No permissions');
    }

    const course = await this.courseRepository.create({
      title,
      description,
      author: user.username,
      authorId: userId,
    });

    await user.$add('courses', course);

    return course;
  }

  async deleteCourse(courseId: number, userId: number) {
    const user = await this.userRepository.findByPk(userId);
    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    if (course.authorId !== userId) {
      throw new ForbiddenException('No permissions');
    }

    try {
      const tests = await this.testRepository.findAll({ where: { courseId } });

      await Promise.all(
        tests.map(async (test) => {
          const testId = test.id;
          const testResults = await this.testResultRepository.findAll({
            where: { testId },
          });
          const questions = await this.quesitonRepository.findAll({
            where: { testId },
          });

          await Promise.all([
            this.testResultRepository.destroy({ where: { testId } }),
            this.testRepository.destroy({ where: { id: testId } }),
            this.quesitonRepository.destroy({ where: { testId } }),
            ...testResults.map((result) =>
              this.userAnswerRepository.destroy({
                where: { testResultId: result.id },
              }),
            ),
            ...questions.map((question) =>
              this.answerRepository.destroy({
                where: { questionId: question.id },
              }),
            ),
          ]);
        }),
      );

      await Promise.all([course.destroy(), user.$remove('courses', course)]);

      return true;
    } catch {
      throw new InternalServerErrorException('Course was not deleted');
    }
  }

  async getCoursesByUserId(userId: number) {
    const user = await this.userRepository.findByPk(userId, {
      include: [
        {
          model: this.courseRepository,
          as: 'courses',
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const courses = await Promise.all(
      user.courses.map(async (course) => {
        const subscribed = await this.userCourseRepository.findOne({
          where: { courseId: course.id, userId },
        });

        return {
          ...course.toJSON(),
          base64Image: subscribed ? subscribed.base64Image : null,
        };
      }),
    );

    return courses;
  }

  async getAllCourses(): Promise<Course[]> {
    const courses = await this.courseRepository.findAll();
    return courses;
  }

  async getCourseById(courseId: number, userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subscribed = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });

    return {
      id: course.id,
      author: course.author,
      authorId: course.authorId,
      title: course.title,
      description: course.description,
      isAuthor: course.authorId === userId ? true : false,
      isSubscribed: subscribed ? true : false,
    };
  }

  async subscribe(courseId: number, userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subscribed = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });

    if (subscribed) {
      throw new ForbiddenException('User is subscribed to the course');
    }

    try {
      await this.userCourseRepository.create({ userId, courseId });
      return true;
    } catch {
      throw new InternalServerErrorException('Not subscribed to the course');
    }
  }

  async unsubscribe(courseId: number, userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subscribed = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });

    if (!subscribed) {
      throw new NotFoundException('User is not subscribed to the course');
    }

    if (course.authorId === subscribed.userId) {
      throw new ForbiddenException('No permissions');
    }

    try {
      await this.userCourseRepository.destroy({ where: { userId, courseId } });
      return true;
    } catch {
      throw new InternalServerErrorException(
        'Not unsubscribed from the course',
      );
    }
  }

  async setCoverToCourse(
    base64Image: string,
    courseId: number,
    userId: number,
  ) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const subscribed = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });

    if (!subscribed) {
      throw new NotFoundException('User is not subscribed to the course');
    }

    await subscribed.update({ base64Image });

    return true;
  }
}
