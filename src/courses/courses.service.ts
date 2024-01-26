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
        username: user.username,
      });

      await user.$add('courses', course);

      return course;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async deleteCourse(courseId: number, userId: number) {
    const course = await this.courseRepository.findByPk(courseId);
    const user = await this.userRepository.findByPk(userId);

    if (!course) {
      throw new NotFoundException(`Course not found`);
    } else if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.$remove('courses', course);
    await course.destroy();
  }

  async getCoursesByUserId(userId: number): Promise<Course[]> {
    const user = await this.userRepository.findByPk(userId, {
      include: [{ model: Course, as: 'courses' }],
    });

    if (user) {
      return user.courses;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async getAllCourses(): Promise<Course[]> {
    const courses = this.courseRepository.findAll();
    return courses;
  }
}
