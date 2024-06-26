import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './users.model';
import { Course } from 'src/courses/courses.model';

type CreationAttrs = {
  userId: number;
  courseId: number;
};

@Table({ tableName: 'users_courses', createdAt: false, updatedAt: false })
export class UsersCourses extends Model<UsersCourses, CreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => Course)
  @Column({ type: DataType.INTEGER })
  courseId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  base64Image: string;
}
