const express = require('express');

const {
    createOrder,
    getOrder,
    getsOrder,
    deleteOrder,
    updateOrder
} = require('../serves/orderServes');

const {
    createOrderValidator,
    getOrderValidator,
    deleteOrderValidator,
    updateOrderValidator
} = require('../utils/validators/orderValidat');

const router = express.Router();

router.route('/')
.get(getOrderValidator,getsOrder)
.post(createOrderValidator,createOrder)

router.route('/:id')
.get(getOrderValidator,getOrder)
.delete(deleteOrderValidator,deleteOrder)
.put(updateOrderValidator,updateOrder)









module.exports = router;