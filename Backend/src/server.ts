import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import routes
import authRoutes from './routes/auth';
// import quizRoutes from './routes/quiz';
// import groupRoutes from './routes/group';
import subscriptionRoutes from './routes/subscription';
import webhookRoutes from './routes/webhook';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5023;

// Middleware
app.use(cors());

// Webhook routes - This must be before the express.json() middleware for Stripe webhooks
app.use('/webhooks', webhookRoutes);

// Regular middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/groups', groupRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
