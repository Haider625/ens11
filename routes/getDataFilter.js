const express = require('express');

const {
dataFilterOrderCreater,
dataFilterOnpraseCreater,
dataFilterRejectCreater,
dataFilterArchiveCreater,
dataFilterOrderSender,
dataFilterOnpraseSender,
dataFilterRejectSender,
dataFilterArchiveSender

} = require('../serves/getDataFilter');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);


router.get(('/orderCreater'),dataFilterOrderCreater);

router.get(('/onpraseCreater'),dataFilterOnpraseCreater);

router.get(('/rejectCreater'),dataFilterRejectCreater);

router.get(('/archiveCreater'),dataFilterArchiveCreater);


router.get(('/orderSender'),dataFilterOrderSender);

router.get(('/onpraseSender'),dataFilterOnpraseSender);

router.get(('/rejectSender'),dataFilterRejectSender);

router.get(('/archiveSender'),dataFilterArchiveSender);

module.exports = router;