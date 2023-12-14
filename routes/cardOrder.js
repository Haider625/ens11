const express = require('express');

const {
    createcardOrder,
    getcardOrder,
    getscardOrder,
    deletecardOrder,
    updatecardOrder
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
.get(
    auth.allowedTo('admin'),
    getscardOrder)
 .post(createcardOrder)

router.route('/:id')
.get(getcardOrder)
.delete(deletecardOrder)
.put(updatecardOrder)


module.exports = router;