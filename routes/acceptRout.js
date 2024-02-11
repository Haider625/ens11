const express = require('express');

const {
    getUserOrders,
    getUsersInGroup,
    acceptOrder,
    acceptwork,
    startWork,
    endWork,
    confirmWorkCompletion,
    AcceptArchive,
 
} = require('../serves/accept');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get(('/getuser'),getUsersInGroup)

router.get(('/OrdersUser'),getUserOrders)


router.put(('/acceptwork/:id'),acceptwork)

router.put(('/acceptorder/:id'),acceptOrder)

router.put(('/startwork/:id'),startWork)

router.put(('/endwork/:id'),endWork)

router.put(('/confirm/:id'),confirmWorkCompletion)

router.post('/Archive',AcceptArchive)

module.exports = router;