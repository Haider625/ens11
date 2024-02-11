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
.get(getsArchive)
.post(createArchive);


router.get('/accept',getArchivesAccept)
router.get('/reject',getArchivesReject)

router.route('/:id')
.get(getArchive)
.delete(deleteArchive)
.put(updateArchive)

module.exports = router;