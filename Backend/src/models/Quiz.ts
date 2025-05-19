import mongoose, { Schema } from "mongoose";
import { IQuiz, IQuestion } from "../types/interfaces";

const QuestionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ["MCQ", "shortAnswer", "longAnswer", "trueFalse"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  gifUrl: {
    type: String,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: Schema.Types.Mixed, // Can be string or array of strings
    required: true,
  },
});

const QuizSchema: Schema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    allowInternet: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
