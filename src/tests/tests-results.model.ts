import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Test } from './tests.model';
import { User } from 'src/users/users.model';
import { UserAnswer } from './users-answers.model';

@Table({ tableName: 'tests_results' })
export class TestResult extends Model<TestResult> {
  @ForeignKey(() => Test)
  @Column(DataType.INTEGER)
  testId: number;

  @BelongsTo(() => Test)
  test: Test;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => UserAnswer)
  userAnswers: UserAnswer[];

  @Column(DataType.INTEGER)
  score: number;
}
