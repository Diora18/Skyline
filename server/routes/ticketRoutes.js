const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.post('/', auth, ticketController.purchaseTicket);
router.get('/my', auth, ticketController.getMyTickets);
router.get('/event/:eventId', auth, ticketController.getEventTickets);
router.post('/scan', auth, ticketController.scanTicket);

module.exports = router;
