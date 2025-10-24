const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/events', require('./events'));
router.use('/analytics', require('./analytics'));

module.exports = router;
