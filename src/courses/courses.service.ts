import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from './courses.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { ROLES } from 'src/users/enums/roles.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course) private courseRepository: typeof Course,
    @InjectModel(User) private userRepository: typeof User,
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

  async getCourseById(courseId: number): Promise<Course> {
    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }
}
