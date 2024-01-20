const express = require('express');

const {
    getWordText,getsWordText,
    createWordText,
    deleteWordText,
    updateWordText
} = require('../serves/wordText');

const {
    getWordTextValidator,
    createWordTextValidator,
    deleteWordTextValidator,
    updateWordTextValidator
} = require('../utils/validators/wordText');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(auth.allowedTo('admin'),getsWordText)
.post(auth.allowedTo('admin'),createWordTextValidator,createWordText);

router.route('/:id')
.get(auth.allowedTo('admin'),getWordTextValidator,getWordText)
.delete(auth.allowedTo('admin'),deleteWordTextValidator,deleteWordText)
.put(auth.allowedTo('admin'),updateWordTextValidator,updateWordText)

module.exports = router;