import mongoose, { Schema } from 'mongoose';

interface IGroup {
  name: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  enrollmentCode: string;
  students: mongoose.Types.ObjectId[];
  exams: mongoose.Types.ObjectId[];
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
  },
  {
    timestamps: true,
  }
);

// Create index on enrollment code for fast lookups
GroupSchema.index({ enrollmentCode: 1 });

export default mongoose.model<IGroup>('Group', GroupSchema); 