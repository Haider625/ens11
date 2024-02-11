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


// router.get(('/getAccepts'),getAccepts)

router.get(('/getOrders'),forwordOrdersUp)
router.get(('/forwordWorkDown'),forwordWorkDown)

// router.get(('/getRejects'),getRejects)

// router.put(('/reject/:id'),reject)

// router.put(('/accept/:id'),accept)

router.put('/forwordOrder/:orderId',forwordOrder)

module.exports = router;