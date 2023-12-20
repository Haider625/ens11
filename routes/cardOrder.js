const express = require('express');

const {
    createcardOrder,
    getcardOrder,
    rejectOrder,
    acceptOrder,
    // forwordOrder,
    // waitOrder
} = require('../serves/caedOrder');

const {
    acceptValidate
} = require('../utils/validators/cardOrder');

const auth = require('../serves/auth')

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(acceptValidate,getcardOrder)
 .post(
    acceptValidate,
    createcardOrder
    )

router.put(('/accept/:id'),acceptOrder)
// .get(getcardOrder)
// .delete(deletecardOrder)
router.put(('/reject/:id'),rejectOrder)


module.exports = router;