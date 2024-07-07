const express = require('express');

const {
    getJobTitle,
    getsJobTitle,
    createJobTitle,
    deleteJobTitle,
    updateJobTitle

} = require('../serves/JobTitle');

// const {

// } = require('../utils/validators/wordText');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getsJobTitle)
.post(createJobTitle);

router.route('/:id')
.get(getJobTitle)
.delete(deleteJobTitle)
.put(updateJobTitle)

module.exports = router;