const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimiter); // simple rate limiter

app.use((req, res, next) => {
  req.log = logger.child({ reqId: Date.now() });
  next();
});

// API routes
app.use('/api', routes);

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// error handler (last)
app.use(errorHandler);

module.exports = app;
