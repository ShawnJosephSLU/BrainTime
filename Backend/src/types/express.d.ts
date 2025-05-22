// Declaration merging for Express Request object
import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'creator' | 'student';
        subscriptionPlan?: string;
        isEmailVerified: boolean;
      };
    }
  }
} 