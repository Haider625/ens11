
const express = require('express');

const {
    getOrder,
    deleteOrder,
    updateOrder,
    getOrders,
    createOrderSend,
    uploadOrderImage,
    resizeImage
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
.get(getOrders)
.post(uploadOrderImage,resizeImage,createOrderValidator,createOrderSend);

router.route('/:id')
.get(getOrderValidator,getOrder)
.put(uploadOrderImage,resizeImage,updateOrderValidator,updateOrder)
.delete(deleteOrderValidator,deleteOrder)

router.post('/createOrderSend',createOrderValidator,createOrderSend)


module.exports = router;