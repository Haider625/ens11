const express = require('express');
const {
  singupValidator,
  loginValidator,
 
} = require('../utils/validators/auth');

const {
  singup,
  login,
  logout
} = require('../serves/auth');

const router = express.Router();

router.post('/signup', singupValidator, singup);
router.post('/login', loginValidator, login);
router.get('/logout', logout);

module.exports = router;