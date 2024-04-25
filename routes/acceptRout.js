const express = require('express');

const {
    getUserOrders,
    getUsersInGroup,
    acceptOrder,
    acceptwork,
    startWork,
    endWork,
    confirmCompletion,
    AcceptArchive,
    uploadOrderImage,
    resizeImage,
    confirmWork
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

router.put(('/confirmWork/:id'),uploadOrderImage,resizeImage,confirmWork)

router.put(('/confirm/:id'),confirmCompletion)

router.put('/Archive/:id',AcceptArchive)

module.exports = router;