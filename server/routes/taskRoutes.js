const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.post('/', auth, taskController.createTask);
router.patch('/:id', auth, taskController.updateTask); // Controller checks officer OR assigned volunteer
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
