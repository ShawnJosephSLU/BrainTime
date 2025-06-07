export interface IQuestion {
  _id?: string;
  type: 'MCQ' | 'multipleSelect' | 'shortAnswer' | 'longAnswer' | 'trueFalse' | 'fillInTheBlank' | 'matching' | 'ordering';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  options?: string[];
  correctAnswer: string | string[] | any;
  points: number;
  timeLimit?: number | null; // in seconds
  explanation?: string;
  matchingPairs?: { left: string; right: string }[];
  orderItems?: string[];
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
  isPublic: boolean;
  selectedGroups: string[];
}

export const emptyQuestion: IQuestion = {
  type: 'MCQ',
  text: '',
  options: ['', ''],
  correctAnswer: '',
  points: 1,
  timeLimit: null,
  explanation: '',
  matchingPairs: [],
  orderItems: [],
}; 