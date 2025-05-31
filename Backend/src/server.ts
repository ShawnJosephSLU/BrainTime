import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { trackUserActivity, refreshToken } from './middleware/sessionMiddleware';

// Load environment variables from root of the Backend folder
dotenv.config();

// Log important environment variables
console.log('Environment Configuration:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
console.log('- EMAIL_HOST:', process.env.EMAIL_HOST);

// Import routes
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import groupRoutes from './routes/group';
import subscriptionRoutes from './routes/subscription';
import webhookRoutes from './routes/webhook';
import adminRoutes from './routes/admin';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5023;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(trackUserActivity);

// Webhook routes - This must be before the express.json() middleware for Stripe webhooks
app.use('/webhooks', webhookRoutes);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/braintime';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('BrainTime API is running');
});

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Test route for refreshToken (can be removed or integrated into authRoutes properly later)
// app.post('/api/refresh-token', refreshToken);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
