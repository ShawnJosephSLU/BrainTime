import mongoose, { Schema } from 'mongoose';

interface IGroup {
  name: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  enrollmentCode: string;
  students: mongoose.Types.ObjectId[];
  exams: mongoose.Types.ObjectId[];
  isPublic: boolean;
  password?: string;
  maxStudents?: number;
  tags: string[];
  settings: {
    allowSelfEnrollment: boolean;
    requireApproval: boolean;
    emailNotifications: boolean;
  };
  analytics: {
    totalStudents: number;
    activeStudents: number;
    completedExams: number;
    averageScore: number;
  };
}

const GroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentCode: {
      type: String,
      required: true,
      unique: true,
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    exams: [{
      type: Schema.Types.ObjectId,
      ref: 'Quiz'
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    maxStudents: {
      type: Number,
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    settings: {
      allowSelfEnrollment: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    analytics: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      activeStudents: {
        type: Number,
        default: 0,
      },
      completedExams: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGroup>('Group', GroupSchema);