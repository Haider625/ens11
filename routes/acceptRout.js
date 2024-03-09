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
    uploadOrderImage,
    resizeImage,
} = require('../serves/accept');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get(('/getuser'),getUsersInGroup)

router.get(('/OrdersUser'),getUserOrders)


router.put(('/acceptwork/:id'),acceptwork)

router.put(('/acceptorder/:id'),acceptOrder)

router.put(('/startwork/:id'),startWork)

router.put(('/endwork/:id'),uploadOrderImage,resizeImage,endWork)

router.put(('/confirm/:id'),confirmWorkCompletion)

router.put('/Archive/:id',AcceptArchive)

module.exports = router;