const express = require('express');

const {
getAccepts,
forwordOrdersUp,
getRejects,
reject,
accept,
forwordOrder,
forwordWorkDown
} = require('../serves/forword');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);


router.get(('/getGroups'),forwordOrdersUp)
router.get(('/forwordWorkDown'),forwordWorkDown)

router.put('/forwordOrder/:orderId',forwordOrder)

module.exports = router;