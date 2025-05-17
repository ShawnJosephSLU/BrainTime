import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

// Import routes
import userRoutes from './routes/user.routes';

// Create Express app
const app = express();

// Body parsing middleware - put this early
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Standard middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logging

// Debug middleware
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// API Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'BrainTime API is running' });
});

// Default route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Welcome to BrainTime API', 
    documentation: 'See README.md for API documentation' 
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    status: 'error',
    message: `Cannot ${req.method} ${req.path}` 
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

export default app;
