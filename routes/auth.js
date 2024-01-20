const express = require('express');
const {
  singupValidator,
  loginValidator,
} = require('../utils/validators/auth');

const {
  singup,
  login
} = require('../serves/auth');

const router = express.Router();

router.post('/singup', singupValidator, singup);
router.post('/login', loginValidator, login);

module.exports = router;