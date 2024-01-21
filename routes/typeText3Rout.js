const express = require('express');

const {
    getstypeText3,
    gettypeText3,
    createtypeText3,
    deletetypeText3,
    updatetypeText3
} = require('../serves/typeText3');

const {
    getTypeText3Validator,
    createTypeText3Validator,
    deleteTypeText3Validator,
    updateTypeText3Validator
} = require('../utils/validators/typeText3');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getstypeText3)
.post(createTypeText3Validator,createtypeText3);

router.route('/:id')
.get(getTypeText3Validator,gettypeText3)
.delete(deleteTypeText3Validator,deletetypeText3)
.put(updateTypeText3Validator,updatetypeText3)

module.exports = router;