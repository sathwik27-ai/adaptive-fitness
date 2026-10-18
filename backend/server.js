const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./config/env').validateEnv();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const setupHealthSync = require('./background/healthSync');

// Passport config
require('./config/passport');

const app = express();

// Security headers
app.use(helmet());

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = new Set([frontendOrigin]);
if (process.env.NODE_ENV !== 'production') {
  const localOrigin = new URL(frontendOrigin);
  if (localOrigin.hostname === 'localhost') {
    localOrigin.hostname = '127.0.0.1';
    allowedOrigins.add(localOrigin.origin);
  } else if (localOrigin.hostname === '127.0.0.1') {
    localOrigin.hostname = 'localhost';
    allowedOrigins.add(localOrigin.origin);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Body parsers
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// HTTP logger in dev
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/posture', require('./routes/posture'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/health', require('./routes/health'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  setupHealthSync();

  const PORT = process.env.PORT || 5000;
  return app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error(`Server startup failed: ${err.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
