// Centralized, validated environment configuration.
// Importing this module guarantees required secrets exist before the app runs,
// so we never silently fall back to an insecure hardcoded JWT secret.
import dotenv from 'dotenv';

// Load .env here so this module works no matter where it is imported from.
// ES module imports execute before the importing file's body, so relying on a
// dotenv.config() call in server.js would be too late for the checks below.
dotenv.config();

// JWT_SECRET is mandatory. If it is missing we fail fast with a clear message
// instead of signing/verifying tokens with a public, hardcoded string.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  console.error(
    '\n❌ Missing required environment variable: JWT_SECRET\n' +
      '   The server cannot sign or verify auth tokens without it.\n' +
      '   Set JWT_SECRET in backend/.env (local) or your host\'s env settings (production).\n' +
      '   Generate a strong value, e.g. a long random string.\n'
  );
  // Exit before the server starts listening or accepts any request.
  process.exit(1);
}

// Comma-separated list of allowed browser origins for CORS.
// Falls back to the common local dev origins so local development works out of the box.
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export { JWT_SECRET, CLIENT_ORIGINS };
