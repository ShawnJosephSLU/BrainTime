import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRoles, UserRole, SubscriptionPlans } from '../models/User'; // Ensuring UserRole and SubscriptionPlans are imported
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    // In a real app, you might have a more sophisticated error handling or a fallback, 
    // but throwing an error here makes the configuration issue explicit.
    throw new Error('Server configuration error: JWT secret missing.');
  }
  return jwt.sign({ id: userId, email, role }, jwtSecret, {
    expiresIn: '1d', // Token expiry: 1 day
  });
};

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

// Helper function to create a user with a specific role
const createRoleSpecificUser = async (req: Request, res: Response, role: UserRole): Promise<void> => {
  try {
    const {
      email,
      password,
      name,
      stripeCustomerId,
      subscriptionPlan,
      trialExpiry,
      profilePic,
      verificationCode,
      city,
      address1,
      address2, // Optional
      country
    } = req.body;

    // --- Input Validation ---
    const requiredFields = [
      'email', 'password', 'name', 'stripeCustomerId', 'subscriptionPlan',
      'trialExpiry', 'verificationCode', 'city', 'address1', 'country'
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        res.status(400).json({ message: `${field} is required.` });
        return;
      }
    }

    if (!/.+@.+\..+/.test(email)) {
      res.status(400).json({ message: 'Invalid email format.' });
      return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        return;
    }
    if (!Object.values(SubscriptionPlans).includes(subscriptionPlan as any)) {
        res.status(400).json({ message: 'Invalid subscription plan specified.' });
        return;
    }
    // Consider validating trialExpiry is a valid date string before new Date()
    try {
      new Date(trialExpiry); // Check if trialExpiry is a valid date string
    } catch (e) {
      res.status(400).json({ message: 'Invalid trialExpiry date format.' });
      return;
    }

    // --- Check for Existing User ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    // --- Create New User ---
    const newUserPayload: Partial<IUser> = {
      email,
      passwordHash: password, // Plain password, model will hash it
      role,
      name,
      stripeCustomerId,
      subscriptionPlan,
      trialExpiry: new Date(trialExpiry),
      verificationCode,
      city,
      address1,
      country,
    };
    if (profilePic) {
      newUserPayload.profilePic = profilePic;
    }
    if (address2) {
      newUserPayload.address2 = address2;
    }

    const newUser = new User(newUserPayload);
    await newUser.save();

    // --- Generate JWT ---
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // --- Send Success Response ---
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({ token, user: userResponse, message: `User created successfully as ${role}.` });

  } catch (error) {
    console.error(`Error during ${role} signup:`, error);
    if (error instanceof Error && error.message.startsWith('Server configuration error')) {
        res.status(500).json({ message: error.message });
    } else {
        res.status(500).json({ message: `An unexpected error occurred during ${role} signup.` });
    }
  }
};

// Original signupUser (can be kept for generic signup or removed if not needed)
export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, name } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      res.status(400).json({ message: 'Invalid email format.' });
      return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        return;
    }
    // Role validation is important if this generic endpoint is kept
    if (role && !Object.values(UserRoles).includes(role as any)) {
        res.status(400).json({ message: 'Invalid user role specified.' });
        return;
    }

    // --- Check for Existing User ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    // --- Create New User ---
    const newUserPayload: Partial<IUser> = {
      email,
      passwordHash: password,
      role: role || UserRoles.STUDENT, // Default role if not provided via this generic route
    };
    if (name) {
      newUserPayload.name = name;
    }

    const newUser = new User(newUserPayload);
    await newUser.save();

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({ token, user: userResponse, message: 'User created successfully.' });

  } catch (error) {
    console.error('Error during signup:', error);
    if (error instanceof Error && error.message.startsWith('Server configuration error')) {
        res.status(500).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'An unexpected error occurred during signup.' });
    }
  }
};

export const signupStudent = async (req: Request, res: Response): Promise<void> => {
  await createRoleSpecificUser(req, res, UserRoles.STUDENT);
};

export const signupCreator = async (req: Request, res: Response): Promise<void> => {
  await createRoleSpecificUser(req, res, UserRoles.CREATOR);
};

export const signupAdmin = async (req: Request, res: Response): Promise<void> => {
  // IMPORTANT: Creating admins should ideally be a protected route,
  // restricted to existing authenticated admins.
  // For now, it's set up like the others for demonstration.
  // You'll want to add authentication and authorization middleware here in a real app.
  await createRoleSpecificUser(req, res, UserRoles.ADMIN);
};

export const uploadProfilePic = [
  upload.single('profilePic'),
  async (req: Request, res: Response) => {
    try {
      const userEmail = req.body.email;
      const file = (req as MulterRequest).file;
      if (!file || !userEmail) {
        res.status(400).json({ message: 'Email and image are required.' });
        return;
      }
      const s3Key = `braintime-app/${userEmail}/dp/${Date.now()}-${file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }));
      const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      await User.findOneAndUpdate({ email: userEmail }, { profilePic: s3Url });
      res.json({ message: 'Profile picture uploaded.', url: s3Url });
    } catch (err) {
      res.status(500).json({ message: 'Upload failed', error: err });
    }
  }
];

// TODO: Add login controller
// TODO: Add controllers for other user operations (get profile, update profile, etc.)
