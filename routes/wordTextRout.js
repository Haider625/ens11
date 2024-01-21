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
.get(getsWordText)
.post(createWordTextValidator,createWordText);

router.route('/:id')
.get(getWordTextValidator,getWordText)
.delete(deleteWordTextValidator,deleteWordText)
.put(updateWordTextValidator,updateWordText)

module.exports = router;