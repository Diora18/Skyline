const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const {
  registrationValidation,
  loginValidation,
} = require('../middleware/authValidation');

router.post('/register', registrationValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
