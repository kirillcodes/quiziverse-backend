import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './users.model';
import { Course } from 'src/courses/courses.model';

@Table({ tableName: 'user_courses' })
export class UserCourse extends Model<UserCourse> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Course)
  @Column
  courseId: number;
}
