const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', teamController.getTeamMembers);
router.post('/', auth, roleCheck('officer'), teamController.addTeamMember);
router.put('/:id', auth, roleCheck('officer'), teamController.updateTeamMember);
router.delete('/:id', auth, roleCheck('officer'), teamController.deleteTeamMember);

module.exports = router;
