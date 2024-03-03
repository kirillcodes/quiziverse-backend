import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Course } from 'src/courses/courses.model';
import { Question } from './questions.model';

type TestCreationAttrs = {
  title: string;
  timeLimit: number;
  startDate: Date;
  courseId: number;
};

@Table({ tableName: 'tests' })
export class Test extends Model<Test, TestCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  timeLimit: number;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: Date;

  @ForeignKey(() => Course)
  @Column({ type: DataType.INTEGER, allowNull: false })
  courseId: number;

  @BelongsTo(() => Course)
  course: Course;

  @HasMany(() => Question)
  questions: Question[];
}
