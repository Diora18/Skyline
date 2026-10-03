const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, roleCheck('officer'), productController.createProduct);
router.patch('/:id', auth, roleCheck('officer'), productController.updateProduct);
router.patch('/:id/stock', auth, roleCheck('officer'), productController.updateVariantStock);

module.exports = router;
