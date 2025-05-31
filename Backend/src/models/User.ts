import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/interfaces';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const UserSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
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
      enum: ['admin', 'creator', 'student'],
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    name: {
      type: String,
      trim: true,
      required: false,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      required: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  const user = this as typeof this & { passwordHash: string };
  if (!user.isModified('passwordHash')) return next();
  
  // Check if the password is already hashed (bcrypt hashes start with $2b$)
  if (user.passwordHash.startsWith('$2b$')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hide sensitive fields when converting to JSON
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.email; // Hide email from other users
  delete obj.verificationToken;
  delete obj.verificationTokenExpiry;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model<IUser>('User', UserSchema);
