const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', announcementController.getAnnouncements);
router.post('/', auth, roleCheck('officer'), announcementController.createAnnouncement);
router.delete('/:id', auth, roleCheck('officer'), announcementController.deleteAnnouncement);

module.exports = router;
