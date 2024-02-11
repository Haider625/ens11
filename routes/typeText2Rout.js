const express = require('express');

const {
    getstypeText2,
    gettypeText2,
    createtypeText2,
    deletetypeText2,
    updatetypeText2,
    updateText2,
} = require('../serves/typeText2');

const {
    getTypeText2Validator,
    createTypeText2Validator,
    deleteTypeText2Validator,
    updateTypeText2Validator
} = require('../utils/validators/typeText2');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getstypeText2)
.post(createTypeText2Validator,createtypeText2);

router.put('/updateText2/:id',updateText2)

router.route('/:id')
.get(getTypeText2Validator,gettypeText2)
.delete(deleteTypeText2Validator,deletetypeText2)
.put(updateTypeText2Validator,updatetypeText2)

module.exports = router;