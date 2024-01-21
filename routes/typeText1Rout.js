const express = require('express');

const {
    getstypeText1,
    gettypeText1,
    createtypeText1,
    deletetypeText1,
    updatetypeText1
} = require('../serves/typeText1');

const {
    getTypeText1Validator,
    createTypeText1Validator,
    deleteTypeText1Validator,
    updateTypeText1Validator
} = require('../utils/validators/typeText1');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getstypeText1)
.post(createTypeText1Validator,createtypeText1);

router.route('/:id')
.get(getTypeText1Validator,gettypeText1)
.delete(deleteTypeText1Validator,deletetypeText1)
.put(updateTypeText1Validator,updatetypeText1)

module.exports = router;