export class CreateTestDto {
  readonly title: string;
  readonly timeLimit: number;
  readonly startDate: Date;
  readonly questions: QuestionDto[];
}

class QuestionDto {
  readonly text: string;
  readonly answers: AnswerDto[];
  readonly rightAnswer: number;
  readonly points: number;
}

class AnswerDto {
  readonly text: string;
}
