const express = require('express');

const {
    createOrder,
    getOrder,
    getsOrder,
    deleteOrder
} = require('../serves/orderServes');

const router = express.Router();

router.route('/').post(createOrder);

router.route('/:id')
.get(getOrder)
.delete(deleteOrder)

router.route('/').get(getsOrder)








module.exports = router;