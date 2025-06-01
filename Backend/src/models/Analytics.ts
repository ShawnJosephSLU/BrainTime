import mongoose, { Schema, Document } from 'mongoose';

interface IAnalytics extends Document {
  quizId: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  
  // Performance metrics
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  
  // Question-level analytics
  questionAnalytics: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
    answer: any;
    points: number;
    maxPoints: number;
  }>;
  
  // Behavioral analytics
  behaviorMetrics: {
    questionsRevisited: number;
    averageTimePerQuestion: number;
    longestTimeOnQuestion: number;
    shortestTimeOnQuestion: number;
    questionsSkipped: number;
    questionsChangedAnswer: number;
  };
  
  // Device and environment
  deviceInfo: {
    userAgent?: string;
    screenResolution?: string;
    browserLanguage?: string;
    timezone?: string;
  };
}

const AnalyticsSchema: Schema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamSession',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    questionAnalytics: [{
      questionId: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      timeSpent: {
        type: Number,
        required: true,
        min: 0,
      },
      answer: {
        type: Schema.Types.Mixed,
        required: true,
      },
      points: {
        type: Number,
        required: true,
        min: 0,
      },
      maxPoints: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    behaviorMetrics: {
      questionsRevisited: {
        type: Number,
        default: 0,
      },
      averageTimePerQuestion: {
        type: Number,
        default: 0,
      },
      longestTimeOnQuestion: {
        type: Number,
        default: 0,
      },
      shortestTimeOnQuestion: {
        type: Number,
        default: 0,
      },
      questionsSkipped: {
        type: Number,
        default: 0,
      },
      questionsChangedAnswer: {
        type: Number,
        default: 0,
      },
    },
    deviceInfo: {
      userAgent: String,
      screenResolution: String,
      browserLanguage: String,
      timezone: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
AnalyticsSchema.index({ quizId: 1, studentId: 1 });
AnalyticsSchema.index({ groupId: 1 });
AnalyticsSchema.index({ completedAt: -1 });
AnalyticsSchema.index({ percentage: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema); 