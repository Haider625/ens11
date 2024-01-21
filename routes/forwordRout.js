const express = require('express');

// const {

// } = require('../serves/forword');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);



module.exports = router;