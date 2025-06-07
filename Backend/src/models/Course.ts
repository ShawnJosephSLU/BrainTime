import mongoose, { Schema } from 'mongoose';

interface ILesson {
  title: string;
  description?: string;
  type: 'video' | 'reading' | 'assessment';
  content: {
    videoUrl?: string;
    videoDuration?: number;
    readingContent?: string;
    readingEstimatedTime?: number;
    assessmentId?: mongoose.Types.ObjectId;
  };
  order: number;
  isPublished: boolean;
  requirements?: {
    completePrevious: boolean;
    minimumScore?: number;
  };
}

interface ICourse {
  title: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  lessons: ILesson[];
  groups: mongoose.Types.ObjectId[];
  settings: {
    isPublic: boolean;
    enrollmentCode?: string;
    requiresApproval: boolean;
    allowSelfEnrollment: boolean;
    price?: number;
    currency?: string;
  };
  analytics: {
    totalStudents: number;
    completionRate: number;
    averageProgress: number;
    totalWatchTime: number;
  };
  isPublished: boolean;
  publishedAt?: Date;
}

const LessonSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['video', 'reading', 'assessment'],
    required: true,
  },
  content: {
    videoUrl: {
      type: String,
    },
    videoDuration: {
      type: Number, // in seconds
    },
    readingContent: {
      type: String, // Markdown content
    },
    readingEstimatedTime: {
      type: Number, // in minutes
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  },
  order: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  requirements: {
    completePrevious: {
      type: Boolean,
      default: true,
    },
    minimumScore: {
      type: Number, // percentage
      min: 0,
      max: 100,
    },
  },
}, {
  timestamps: true,
});

const CourseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    lessons: [LessonSchema],
    groups: [{
      type: Schema.Types.ObjectId,
      ref: 'Group',
    }],
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      enrollmentCode: {
        type: String,
        unique: true,
        sparse: true,
      },
      requiresApproval: {
        type: Boolean,
        default: false,
      },
      allowSelfEnrollment: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    analytics: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      averageProgress: {
        type: Number,
        default: 0,
      },
      totalWatchTime: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
CourseSchema.index({ creatorId: 1, isPublished: 1 });
CourseSchema.index({ 'settings.isPublic': 1, isPublished: 1 });
CourseSchema.index({ category: 1, tags: 1 });

export default mongoose.model<ICourse>('Course', CourseSchema); 