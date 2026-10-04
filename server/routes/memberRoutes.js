const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const eventVolunteerController = require('../controllers/eventVolunteerController');

router.get('/', auth, roleCheck('officer'), memberController.getMembers);
router.get('/me/volunteering', auth, eventVolunteerController.getMyApplications);
router.get('/:id', auth, memberController.getMemberById);
router.post('/pay-dues', auth, memberController.payDues);
router.patch('/:id/role', auth, roleCheck('officer'), memberController.updateRole);
router.post('/:id/send-reminder', auth, roleCheck('officer'), memberController.sendReminder);

module.exports = router;
