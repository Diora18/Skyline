const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: errors.array()[0].msg,
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }

  next();
};

module.exports = { handleValidationErrors };
