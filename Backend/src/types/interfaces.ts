import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'admin' | 'creator' | 'student';
  stripeCustomerId?: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Enterprise' | null;
  trialExpiry?: Date;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
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
  options?: string[];
  correctAnswer: string | string[];
}

export interface IQuiz extends Document {
  adminId: string;
  title: string;
  description: string;
  groupId: string;
  questions: IQuestion[];
  startTime: Date;
  endTime: Date;
  duration: number;
  allowInternet: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup extends Document {
  adminId: string;
  name: string;
  students: string[];
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
  _id: string;
  questionId: string;
  studentAnswer: string | string[];
}

export interface IResponse extends Document {
  quizId: string;
  studentId: string;
  answers: IAnswer[];
  submittedAt: Date;
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
