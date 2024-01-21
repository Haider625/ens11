const express = require('express');
const {
  singupValidator,
  loginValidator,
 
} = require('../utils/validators/auth');

const {
  singup,
  login,
  uploadUserImage,
  resizeImage
} = require('../serves/auth');

const router = express.Router();

router.post('/singup',uploadUserImage,resizeImage, singupValidator, singup);
router.post('/login', loginValidator, login);

module.exports = router;