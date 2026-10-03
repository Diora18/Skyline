const express = require('express');
const router = express.Router();
const eventVolunteerController = require('../controllers/eventVolunteerController');
const auth = require('../middleware/auth');

router.get('/volunteers/my', auth, eventVolunteerController.getMyVolunteerAssignments);
router.post('/:eventId/volunteers', auth, eventVolunteerController.applyToVolunteer);
router.get('/:eventId/volunteers', auth, eventVolunteerController.getEventVolunteers);
router.patch('/:eventId/volunteers/:userId', auth, eventVolunteerController.updateVolunteerApplication);
router.delete('/:eventId/volunteers', auth, eventVolunteerController.withdrawVolunteerApplication);

module.exports = router;
