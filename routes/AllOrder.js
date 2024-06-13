
const express = require('express');

const {
    deleteAll,
    getAllOrder,
    getAllText,
    filterCreat,
    getOrders,
    getOnpraseOrders,
    getAllRejected,
    getsArchive,
}= require('../serves/allOrder')

// const {
//     createOrderValidator,
//     getOrderValidator,
//     deleteOrderValidator,
//     updateOrderValidator
// } = require('../utils/validators/orderValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get('/',getOrders)

router.get('/getOnpraseOrders',getOnpraseOrders)

router.get('/rejected',getAllRejected)

router.get('/archive',getsArchive)

router.delete('/deleteAll',deleteAll)

router.get('/getAll',getAllOrder)

router.get('/getAllText',getAllText)
// router.get('/filterCreat',filterCreat)


module.exports = router;