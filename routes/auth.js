const express = require('express');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/auth');

const {
  signup,
  login
} = require('../serves/auth');

const router = express.Router();

router.post('/singup', signupValidator, signup);
router.post('/login', loginValidator, login);

module.exports = router;