import mongoose, { Schema } from "mongoose";
import { IQuiz, IQuestion } from "../types/interfaces";

const QuestionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ["MCQ", "multipleSelect", "shortAnswer", "longAnswer", "trueFalse", "fillInTheBlank", "matching", "ordering"],
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
  videoUrl: {
    type: String,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: Schema.Types.Mixed, // Can be string, array of strings, or object for complex types
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
  timeLimit: {
    type: Number, // in seconds, per-question time limit
    default: null,
  },
  explanation: {
    type: String, // Optional explanation for the correct answer
    default: '',
  },
  matchingPairs: [{
    left: String,
    right: String
  }], // For matching questions
  orderItems: [String], // For ordering questions
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
      required: false, // Can be assigned to multiple groups later
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
    password: {
      type: String,
      required: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    groups: [{
      type: Schema.Types.ObjectId,
      ref: "Group"
    }],
    autoSubmit: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
