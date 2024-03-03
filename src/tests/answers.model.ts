import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Question } from './questions.model';

type AnswerCreationAttrs = {
  text: string;
  questionId: number;
};

@Table({ tableName: 'answers' })
export class Answer extends Model<Answer, AnswerCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @ForeignKey(() => Question)
  @Column({ type: DataType.INTEGER, allowNull: false })
  questionId: number;

  @BelongsTo(() => Question)
  question: Question;
}
