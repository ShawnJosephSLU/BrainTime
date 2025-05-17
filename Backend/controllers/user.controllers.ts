import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRoles } from '../models/User'; // Assuming UserRoles might be useful for validation or default roles

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
      passwordHash: password, // Plain password, model will hash it
      role: role || UserRoles.STUDENT, // Default role
    };
    if (name) {
      newUserPayload.name = name;
    }

    const newUser = new User(newUserPayload);
    await newUser.save();

    // --- Generate JWT ---
    // Mongoose documents have an `id` virtual getter which is `_id.toString()`
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // --- Send Success Response ---
    const userResponse = {
      id: newUser.id, // Use .id for string representation of _id
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

// TODO: Add login controller
// TODO: Add controllers for other user operations (get profile, update profile, etc.)
