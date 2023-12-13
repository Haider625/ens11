const express = require('express');

const {
    createOrder,
    getOrder,
    getsOrder,
    deleteOrder,
    updateOrder
} = require('../serves/orderServes');

// const {
//     createOrderValidator,
//     getOrderValidator,
//     deleteOrderValidator,
//     updateOrderValidator
// } = require('../utils/validators/orderValidat');

const auth = require('../serves/auth')

const router = express.Router();

router.route('/')
.get(
    auth.protect
    ,auth.allowedTo('admin')
    ,getsOrder)
.post(createOrder)

router.route('/:id')
.get(getOrder)
.delete(deleteOrder)
.put(updateOrder)









module.exports = router;