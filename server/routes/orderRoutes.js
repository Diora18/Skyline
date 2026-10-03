const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/', auth, orderController.createOrder);
router.get('/my', auth, orderController.getMyOrders);
router.get('/', auth, roleCheck('officer'), orderController.getAllOrders);
router.patch('/:id/status', auth, roleCheck('officer'), orderController.updateOrderStatus);

module.exports = router;
