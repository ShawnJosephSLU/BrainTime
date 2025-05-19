import crypto from 'crypto';

/**
 * Generate a random token for email verification
 * @returns A random string token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate token expiry date (24 hours from now)
 * @returns Date object representing the expiry time
 */
export const calculateTokenExpiry = (): Date => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24); // Token valid for 24 hours
  return expiryDate;
};
