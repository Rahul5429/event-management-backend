const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000), // default 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX || 100), // limit per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, try later' });
  }
});

module.exports = limiter;
