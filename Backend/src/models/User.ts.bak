import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/interfaces';

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      required: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionPlan: {
      type: String,
      enum: ['Basic', 'Pro', 'Enterprise', null],
      default: null,
    },
    trialExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
