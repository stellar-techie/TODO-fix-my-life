import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (login + register).
// Purpose: slow down brute-force / credential-stuffing attacks without
// affecting normal users. The window and limit are generous enough that
// a real person (or the E2E test suite) never hits them, but an automated
// attacker making hundreds of attempts per minute will be blocked.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // max 30 auth attempts per IP per window
  standardHeaders: 'draft-7', // expose RateLimit-* headers
  legacyHeaders: false, // disable the deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many attempts from this device. Please try again in a little while ♡',
  },
});
