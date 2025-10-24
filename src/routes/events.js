const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');

// public listing with search/filter/pagination
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);

// protected routes
router.use(authMiddleware);

// register / unregister
router.post('/:id/register', eventController.registerForEvent);
router.post('/:id/unregister', eventController.unregisterFromEvent);

// admin/organizer CRUD
router.post('/', rbac(['admin','organizer']), eventController.createEvent);
router.put('/:id', rbac(['admin','organizer']), eventController.updateEvent);
router.delete('/:id', rbac(['admin','organizer']), eventController.deleteEvent);

module.exports = router;
