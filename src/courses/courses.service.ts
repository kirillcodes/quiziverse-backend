import { Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './courses.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course) private courseRepository: typeof Course,
    @InjectModel(User) private userRepository: typeof User,
  ) {}

  async createCourse(title: string, description: string, userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (user) {
      const course = await this.courseRepository.create({
        title,
        description,
        userId
      });
      return course;
    } else {
      throw Error('User not found');
    }
  }

  async deleteCourse(courseId: number) {
    const course = await this.courseRepository.findByPk(courseId);

    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    await course.destroy();
  }

  async addUserToCourse(userId: number, courseId: number): Promise<void> {
    const user = await this.userRepository.findByPk(userId);
    const course = await this.courseRepository.findByPk(courseId);

    if (user && course) {
      await user.$add('courses', course);
    } else {
      throw new Error('User or Course not found');
    }
  }

  async removeUserFromCourse(userId: number, courseId: number): Promise<void> {
    const user = await this.userRepository.findByPk(userId);
    const course = await this.courseRepository.findByPk(courseId);

    if (user && course) {
      await user.$remove('courses', course);
    } else {
      throw new Error('User or Course not found');
    }
  }

  async getCoursesByUserId(userId: number): Promise<Course[]> {
    const user = await this.userRepository.findByPk(userId, {
      include: [{ model: Course, as: 'courses' }],
    });

    if (user) {
      return user.courses;
    } else {
      throw new Error('User not found');
    }
  }
}
