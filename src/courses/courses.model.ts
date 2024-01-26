import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { UsersCourses } from 'src/users/users-courses.model';
import { User } from 'src/users/users.model';

type CourseCreationAttrs = {
  title: string;
  description: string;
  username: string;
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

  @Column({ type: DataType.STRING, allowNull: false })
  username: string;

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

  @BelongsToMany(() => User, () => UsersCourses)
  users: User[];
}
