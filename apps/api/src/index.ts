import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from './utils/jwt';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import channelRoutes from './routes/channels';

const app = express();
const httpServer = createServer(app);

// Socket.IO configuration
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const payload = verifyAccessToken(token);
    socket.data.user = payload;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected via socket: ${socket.data.user.userId}`);
  
  // Join user's personal room for direct notifications
  socket.join(`user:${socket.data.user.userId}`);
  
  // Join workspace room
  socket.join(`workspace:${socket.data.user.workspaceId}`);

  socket.on('join:channel', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('leave:channel', (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.data.user.userId}`);
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 1000, 
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Make io available to routes via req.app.get('io') if needed, though we export it
app.set('io', io);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/channels', channelRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  
  if (err instanceof Error) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: JSON.parse(err.message) } });
    }
  }

  res.status(err.statusCode || 500).json({ 
    error: { 
      code: err.errorCode || 'INTERNAL_SERVER_ERROR', 
      message: err.message || 'An unexpected error occurred' 
    } 
  });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
