const express = require('express');

const {
    createArchive,
    getArchive,
    getsArchive,
    deleteArchive,
    updateArchive,
    getArchivesAccept,
    getArchivesReject
} = require('../serves/archive');

// const {

// } = require('../utils/validators/archive');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(auth.allowedTo('admin'),getsArchive)
.post(auth.allowedTo('admin'),createArchive);

router.route('/:id')
.get(auth.allowedTo('admin'),getArchive)
.delete(auth.allowedTo('admin'),deleteArchive)
.put(auth.allowedTo('admin'),updateArchive)

router.get('/accept',getArchivesAccept)
router.get('/reject',getArchivesReject)
module.exports = router;