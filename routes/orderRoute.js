/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const express = require('express');

const {
    createOrder,
    getOrder,
    getsOrder,
    deleteOrder,
    updateOrder,
    acceptOrder,
    rejectOrder,
    getState,

} = require('../serves/orderServes');

const {
    createOrderValidator,
    getOrderValidator,
    deleteOrderValidator,
    updateOrderValidator
} = require('../utils/validators/orderValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/State')
.get(auth.allowedTo('admin'),getState)
router.route('/')
.get(auth.allowedTo('admin'),getsOrder)
.post( auth.allowedTo('admin'),createOrder)

router.route('/:id')
.get(auth.allowedTo('admin'),getOrder)
.delete(auth.allowedTo('admin'),deleteOrder)

router.put(('/accept/:id'),acceptOrder);
router.put(('/reject/:id'),rejectOrder);

module.exports = router;