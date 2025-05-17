import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Defines the possible roles a user can have within the BrainTime application.
 */
export const UserRoles = {
  ADMIN: 'admin',
  STUDENT: 'student',
  CREATOR: 'creator',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * Defines the subscription plan tiers available.
 */
export const SubscriptionPlans = {
  BASIC: 'Basic',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
} as const;

export type SubscriptionPlan = typeof SubscriptionPlans[keyof typeof SubscriptionPlans];

/**
 * Interface representing a User document in the database.
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string; // Now required
  stripeCustomerId: string; // Now required
  subscriptionPlan: SubscriptionPlan; // Now required
  trialExpiry: Date; // Now required
  profilePic?: string; // Reverted to optional
  verificationCode: string; // Now required
  city: string; // Now required
  address1: string; // Now required
  address2?: string; // address2 can remain optional
  country: string; // Now required
  createdAt: Date;
  updatedAt: Date;
  // Method to compare passwords (added for convenience)
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // Basic email format validation
      match: [/.+@.+\..+/, 'Please fill a valid email address'],
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRoles), required: true },
    name: { type: String, required: true }, // Added name to schema
    stripeCustomerId: { type: String, required: true },
    subscriptionPlan: { type: String, enum: Object.values(SubscriptionPlans), required: true },
    trialExpiry: { type: Date, required: true },
    profilePic: { type: String }, // Reverted to optional (removed required: true)
    verificationCode: { type: String, required: true }, // New field added to schema
    city: { type: String, required: true }, // New field added to schema
    address1: { type: String, required: true }, // New field added to schema
    address2: { type: String }, // address2 can remain optional
    country: { type: String, required: true }, // New field added to schema
  },
  { timestamps: true } // Mongoose will add createdAt and updatedAt
);

// Pre-save hook to hash password
userSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare candidate password with the stored hashed password
userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
