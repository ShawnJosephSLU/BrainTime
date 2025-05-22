import mongoose, { Schema } from "mongoose";
import { IResponse } from "../types/interfaces";

const AnswerSchema: Schema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  studentAnswer: {
    type: Schema.Types.Mixed, // Can be string or array of strings
    required: true,
  },
});

const ResponseSchema: Schema = new Schema(
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
    answers: {
      type: [AnswerSchema],
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create a unique compound index to ensure a student can only submit once per quiz
ResponseSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IResponse>("Response", ResponseSchema); 