import {
  Column,
  ForeignKey,
  BelongsTo,
  Table,
  Model,
  DataType,
} from 'sequelize-typescript';
import { TestResult } from 'src/tests/tests-results.model';
import { Question } from 'src/tests/questions.model';

@Table({ tableName: 'users_answers' })
export class UserAnswer extends Model<UserAnswer> {
  @ForeignKey(() => Question)
  @Column(DataType.INTEGER)
  questionId: number;

  @BelongsTo(() => Question)
  question: Question;

  @Column(DataType.INTEGER)
  chosenAnswerId: number;

  @ForeignKey(() => TestResult)
  @Column(DataType.INTEGER)
  testResultId: number;

  @BelongsTo(() => TestResult)
  testResult: TestResult;
}
