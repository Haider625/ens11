const express = require('express');

const {
    rejectOrder,
    getGroupscanViwGroups,
    rejectWork,
    getRejectedOrders,
    getRejectedWorks,
    getOrdersWithRejectState,
    archiveOrder,
} = require('../serves/reject');

// const {
    
// } = require('../utils/validators/accept');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.get('/order',getRejectedOrders)
router.get('/work',getRejectedWorks)
router.get('/reject',getOrdersWithRejectState)
router.get('/:group',getGroupscanViwGroups)
router.put('/order/:id',rejectOrder)
router.put('/work/:id',rejectWork)
router.post('/archive',archiveOrder)

module.exports = router;