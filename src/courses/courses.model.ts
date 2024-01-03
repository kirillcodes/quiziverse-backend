import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserCourse } from 'src/users/user-course.model';
import { User } from 'src/users/users.model';

type CourseCreationAttrs = {
  title: string;
  description: string;
  userId: number;
};

@Table({ tableName: 'courses' })
export class Course extends Model<Course, CourseCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, unique: true, allowNull: false })
  userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @BelongsToMany(() => User, () => UserCourse)
  users: User[];
}
