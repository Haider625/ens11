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

const router = express.Router();

router.route('/')
.get(getscardOrder)
 .post(createcardOrder)

router.route('/:id')
.get(getcardOrder)
.delete(deletecardOrder)
.put(updatecardOrder)


module.exports = router;