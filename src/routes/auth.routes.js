const express = require('express');
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate,
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate,
  ],
  loginUser
);

router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;
