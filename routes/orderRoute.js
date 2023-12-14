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

router.use(auth.protect);

router.route('/')
.get(
    auth.allowedTo('admin'),
    getsOrder)
.post(
    auth.allowedTo('admin'),
    createOrder);

router.route('/:id')
.get(
    auth.allowedTo('admin'),
    getOrder)
.delete(
    auth.allowedTo('admin'),
    deleteOrder)
.put(
    auth.allowedTo('admin'),
    updateOrder)









module.exports = router;