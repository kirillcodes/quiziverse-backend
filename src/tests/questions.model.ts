import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Test } from './tests.model';

type QuestionCreationAttrs = {
  text: string;
  rightAnswer: number;
  points: number;
  testId: number;
};

@Table({ tableName: 'questions' })
export class Question extends Model<Question, QuestionCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  rightAnswer: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  points: number;

  @ForeignKey(() => Test)
  @Column({ type: DataType.INTEGER, allowNull: false })
  testId: number;

  @BelongsTo(() => Test)
  test: Test;
}
