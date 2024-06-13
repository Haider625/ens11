const express = require('express');

const {
    rejectOrder,
    rejectWork,
    rejectConfirmWork,
    rejectConfirm,
    getRejectedOrders,
    getRejectedWorks,
    // getAllRejected,
    getRejectedDone,
    getUserOrders,
    archiveReject,
    uploadOrderImage,
    resizeImage

} = require('../serves/reject');


const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get('/order',getRejectedOrders)

router.get('/work',getRejectedWorks)

// router.get('/rejected',getAllRejected)

router.get('/done',getRejectedDone)

router.get('/getUserOrders',getUserOrders)

router.put('/order/:id',rejectOrder)

router.put('/work/:id',rejectWork)

router.put('/rejectConfirmWork/:id',rejectConfirmWork)

router.put('/rejectConfirm/:id',uploadOrderImage,resizeImage,rejectConfirm)


router.post('/archive/:id',archiveReject)

module.exports = router;