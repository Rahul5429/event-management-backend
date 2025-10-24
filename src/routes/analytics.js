const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');

router.use(authMiddleware);
router.get('/', rbac(['admin']), analyticsController.getOverview);

module.exports = router;
