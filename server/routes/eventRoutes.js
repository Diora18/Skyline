const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const eventVolunteerController = require('../controllers/eventVolunteerController');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/:id/volunteers', auth, eventVolunteerController.applyToEvent);
router.get('/:id/volunteers', auth, eventVolunteerController.getEventApplications);
router.patch('/:id/volunteers/:applicationId', auth, eventVolunteerController.updateApplication);
router.post('/', auth, roleCheck('officer'), eventController.createEvent);
router.patch('/:id', auth, eventController.updateEvent); // Controller verifies officer OR event manager
router.delete('/:id', auth, roleCheck('officer'), eventController.deleteEvent);
router.patch('/:id/managers', auth, roleCheck('officer'), eventController.manageEventManagers);

module.exports = router;
