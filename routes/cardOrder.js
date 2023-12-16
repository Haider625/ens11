const express = require('express');

const {
    acceptOrder,
    rejuctOrder,
    forwordOrder,
    waitOrder
} = require('../serves/caedOrder');

// const {
//     createOrderValidator,
//     getOrderValidator,
//     deleteOrderValidator,
//     updateOrderValidator
// } = require('../utils/validators');

const auth = require('../serves/auth')

const router = express.Router();

router.use(auth.protect);

router.route('/')
// .get(
//     auth.allowedTo('admin'),
//     getscardOrder)
 .post(acceptOrder)

// router.route('/:id')
// .get(getcardOrder)
// .delete(deletecardOrder)
// .put(updatecardOrder)


module.exports = router;