const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/', auth, taskController.createTask);
router.patch('/:id', auth, taskController.updateTask); // Controller checks officer OR assigned volunteer
router.delete('/:id', auth, roleCheck('officer'), taskController.deleteTask);

module.exports = router;
