const { body } = require('express-validator');

const phoneNumber = body('phone')
  .optional({ values: 'falsy' })
  .trim()
  .custom((value) => {
    const digits = value.replace(/[\s().-]/g, '');
    if (!/^\+?\d{7,15}$/.test(digits)) {
      throw new Error('Phone number must contain 7 to 15 digits.');
    }
    return true;
  });

const registrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or fewer.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/)
    .withMessage('Name may contain letters, spaces, apostrophes, and hyphens only.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be text.')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters.'),
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required.')
    .isAlphanumeric()
    .withMessage('Student ID may contain letters and numbers only.'),
  phoneNumber,
  body('major')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Major must be 100 characters or fewer.'),
  body('graduationYear')
    .optional({ values: 'falsy' })
    .isInt({ min: 1900, max: 2200 })
    .withMessage('Graduation year must be a valid year.'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be text.')
    .notEmpty()
    .withMessage('Password is required.'),
];

module.exports = { registrationValidation, loginValidation };
