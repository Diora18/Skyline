const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/', auth, expenseController.submitExpense);
router.get('/my', auth, expenseController.getMyExpenses);
router.get('/', auth, roleCheck('treasurer', 'officer'), expenseController.getAllExpenses);
router.patch('/:id/review', auth, roleCheck('treasurer', 'officer'), expenseController.reviewExpense);
router.patch('/:id/reimburse', auth, roleCheck('treasurer', 'officer'), expenseController.reimburseExpense);

module.exports = router;
