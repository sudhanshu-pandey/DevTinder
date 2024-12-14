const { check, validationResult } = require('express-validator');

const validateUser = [
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').isStrongPassword().withMessage('Please enter a strong password'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateUser, handleValidation };
