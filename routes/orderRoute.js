
const express = require('express');

const {
    createOrder,
    getOrder,
    deleteOrder,
    updateOrder,
    getsOrders,
    createOrderSend,
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
.get(getsOrders)
.post(createOrderValidator,createOrder);

router.route('/:id')
.get(getOrderValidator,getOrder)
.put(updateOrderValidator,updateOrder)
.delete(deleteOrderValidator,deleteOrder)

router.post('/createOrderSend',createOrderValidator,createOrderSend)


module.exports = router;