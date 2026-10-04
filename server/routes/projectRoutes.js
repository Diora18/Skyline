const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', auth, projectController.getProjects);
router.get('/:id', auth, projectController.getProjectById);
router.post('/', auth, roleCheck('officer'), projectController.createProject);
router.patch('/:id', auth, roleCheck('officer'), projectController.updateProject);

module.exports = router;
