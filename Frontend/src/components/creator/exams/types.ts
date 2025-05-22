export interface IQuestion {
  _id?: string;
  type: 'MCQ' | 'shortAnswer' | 'longAnswer' | 'trueFalse';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface IExamData {
  title: string;
  description: string;
  questions: IQuestion[];
  startTime: Date;
  endTime: Date;
  duration: number;
  allowInternet: boolean;
  password: string;
  autoSubmit: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
}

export const emptyQuestion: IQuestion = {
  type: 'MCQ',
  text: '',
  options: ['', ''],
  correctAnswer: '',
  points: 1,
}; 