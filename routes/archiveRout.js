const express = require('express');

const {
    getsArchive,

} = require('../serves/archive');

// const {

// } = require('../utils/validators/archive');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getsArchive)



module.exports = router;