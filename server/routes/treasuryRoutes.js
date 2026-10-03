const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/summary', auth, roleCheck('treasurer', 'officer'), treasuryController.getSummary);
router.get('/transactions', auth, roleCheck('treasurer', 'officer'), treasuryController.getTransactions);
router.post('/transactions', auth, roleCheck('treasurer', 'officer'), treasuryController.createManualTransaction);

module.exports = router;
