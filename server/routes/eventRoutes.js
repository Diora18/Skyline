const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', optionalAuth, eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', auth, roleCheck('officer'), eventController.createEvent);
router.patch('/:id', auth, eventController.updateEvent); // Controller verifies officer OR event manager
router.delete('/:id', auth, roleCheck('officer'), eventController.deleteEvent);
router.patch('/:id/managers', auth, roleCheck('officer'), eventController.manageEventManagers);

module.exports = router;
