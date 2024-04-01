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

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course) private courseRepository: typeof Course,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UsersCourses)
    private userCourseRepository: typeof UsersCourses,
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
    const course = await this.courseRepository.findByPk(courseId);
    const user = await this.userRepository.findByPk(userId);

    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.$remove('courses', course);
    await course.destroy();
  }

  async getCoursesByUserId(userId: number): Promise<Course[]> {
    const user = await this.userRepository.findByPk(userId, {
      include: [{ model: Course, as: 'courses' }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.courses;
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
    } catch {
      throw new InternalServerErrorException('Not subscribed to the course');
    }

    return true;
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
    } catch {
      throw new InternalServerErrorException(
        'Not unsubscribed from the course',
      );
    }

    return true;
  }
}
