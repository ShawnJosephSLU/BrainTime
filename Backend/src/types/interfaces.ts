import { Document } from 'mongoose';

export interface IUser extends Document {
  _id?: any;
  userId?: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'creator' | 'student';
  name?: string;
  username?: string;
  stripeCustomerId?: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Enterprise' | null;
  trialExpiry?: Date;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  suspended?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  _id: string;
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

export interface IQuiz extends Document {
  adminId: string;
  title: string;
  description: string;
  groupId?: string;
  questions: IQuestion[];
  startTime: Date;
  endTime: Date;
  duration: number;
  allowInternet: boolean;
  password: string;
  isLive: boolean;
  groups?: string[];
  autoSubmit: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  description: string;
  creatorId: string;
  enrollmentCode: string;
  students: string[];
  exams: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentEnrollment extends Document {
  quizId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswer {
  _id?: string;
  questionId: string;
  studentAnswer: string | string[];
  score?: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface IResponse extends Document {
  quizId: string;
  studentId: string;
  answers: IAnswer[];
  submittedAt: Date;
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  isGraded: boolean;
  totalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStripeSubscription extends Document {
  stripeSubscriptionId: string;
  adminId: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'past_due' | 'cancelled';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICurrentAnswer {
  questionId: string;
  answer: string | string[];
}

export interface IExamSession extends Document {
  quizId: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  lastActivity: Date;
  currentAnswers: ICurrentAnswer[];
  createdAt: Date;
  updatedAt: Date;
}
