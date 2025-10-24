const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  console.log('Connecting to database...');
   console.log('MONGO_URI:', uri);
  if (!uri) throw new Error('MONGO_URI not set in env');
 
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  logger.info('MongoDB connected');
}

module.exports = { connectDB };
