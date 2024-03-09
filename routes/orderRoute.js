
const express = require('express');

const {
    getOrder,
    deleteOrder,
    updateOrder,
    getOrders,
    createOrderSend,
    getAllText,
    getOnpraseOrders,
    uploadOrderImage,
    resizeImage,
    putOrder,
    deleteAll,
    getAllOrder
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



router.get('/getAllText',getAllText)

router.get('/getOnpraseOrders',getOnpraseOrders)

router.put('/put/:orderId',uploadOrderImage,resizeImage,putOrder)

router.delete('/deleteAll',deleteAll)

router.get('/getAll',getAllOrder)

router.route('/:id')
.get(getOrderValidator,getOrder)
.put(uploadOrderImage,resizeImage,updateOrderValidator,updateOrder)
.delete(deleteOrderValidator,deleteOrder)

module.exports = router;