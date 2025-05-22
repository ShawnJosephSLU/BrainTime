import mongoose, { Schema } from "mongoose";
import { IExamSession } from "../types/interfaces";

const ExamSessionSchema: Schema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    currentAnswers: [{
      questionId: String,
      answer: Schema.Types.Mixed, // Can be string or array of strings
    }],
  },
  {
    timestamps: true,
  }
);

// Create a unique compound index to ensure a student can only have one active session per quiz
ExamSessionSchema.index({ quizId: 1, studentId: 1, isCompleted: 1 }, { unique: true, partialFilterExpression: { isCompleted: false } });

export default mongoose.model<IExamSession>("ExamSession", ExamSessionSchema); 