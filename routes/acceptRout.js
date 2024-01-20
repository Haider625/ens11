const express = require('express');

const {
    acceptOrder,
    getUsersInGroup,
    startWork,
    endWork,
    confirmWorkCompletion,
    AcceptArchive,
    getUserOrders
} = require('../serves/accept');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get(('/getuser'),getUsersInGroup)

router.get(('/OrdersUser'),getUserOrders)

router.put(('/acceptorder/:id'),acceptOrder)

router.put(('/startwork/:id'),startWork)

router.put(('/endwork/:id'),endWork)

router.put(('/confirm/:id'),confirmWorkCompletion)

router.post('/Archive',AcceptArchive)

module.exports = router;