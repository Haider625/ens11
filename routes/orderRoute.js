/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const express = require('express');

const {
    createOrder,getOrder,getsOrder,deleteOrder,updateOrder,
    acceptOrder,rejectOrder,forwordOrder,
    getsOrders,getDataUserOrder


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

router.route('/')
.get(auth.allowedTo('admin'),getsOrders)
.post( auth.allowedTo('admin','manger'),createOrder)

router.route('/:id')
.get(auth.allowedTo('admin'),getOrder)
.put(updateOrder)
.delete(auth.allowedTo('admin'),deleteOrder)

router.put(('/accept/:id'),auth.allowedTo('admin','manger'),acceptOrder);
router.put(('/reject/:id'),auth.allowedTo('admin','manger'),rejectOrder);
router.put(('/forword/:id'),auth.allowedTo('admin'),forwordOrder)
router.get(('/userData/:id'),getDataUserOrder)
module.exports = router;