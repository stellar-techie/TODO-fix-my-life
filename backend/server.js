// Import env config FIRST. It loads .env and validates required secrets
// (e.g. JWT_SECRET), exiting with a clear error if anything is missing.
import { CLIENT_ORIGINS } from './config/env.js';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Trust the first proxy (Render, and most PaaS hosts, sit in front of the app).
// Required so express-rate-limit sees the real client IP from X-Forwarded-For
// instead of the proxy's IP.
app.set('trust proxy', 1);

// CORS allowlist: only browsers served from these origins may call the API.
// Non-browser clients (curl, the E2E test suite, server-to-server) send no
// Origin header and are always allowed. CLIENT_ORIGINS defaults to local dev
// and can be extended via the CLIENT_ORIGINS env var (e.g. your Vercel URL).
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CLIENT_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TODO: fix my life — Journal & Planner API is blooming 🌸',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', journalRoutes);
app.use('/api/planner', plannerRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Express ONLY after the database connection succeeds. If connectDB()
// throws (e.g. a configured Atlas URI is unreachable), we log and exit — the
// server never comes up against a missing database.
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🌸 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
