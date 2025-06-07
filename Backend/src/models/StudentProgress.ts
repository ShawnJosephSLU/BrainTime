import mongoose, { Schema } from 'mongoose';

interface ILessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  watchTime?: number; // for video lessons in seconds
  lastPosition?: number; // for video lessons, last watched position in seconds
  score?: number; // for assessment lessons
  attempts?: number; // for assessment lessons
}

interface IStudentProgress {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  lastAccessedAt: Date;
  overallProgress: number; // percentage 0-100
  lessonsProgress: ILessonProgress[];
  totalWatchTime: number;
  isCompleted: boolean;
  completedAt?: Date;
  certificateIssued?: boolean;
}

const LessonProgressSchema: Schema = new Schema({
  lessonId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastPosition: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const StudentProgressSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lessonsProgress: [LessonProgressSchema],
    totalWatchTime: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
StudentProgressSchema.index({ courseId: 1, isCompleted: 1 });
StudentProgressSchema.index({ studentId: 1, lastAccessedAt: -1 });

export default mongoose.model<IStudentProgress>('StudentProgress', StudentProgressSchema); 