const express = require('express');

const {
    createUser,
    getUser,
    getsUser,
    deleteUser
} = require('../serves/userServer');

const router = express.Router();

router.route('/').post(createUser);

router.route('/:id')
.get(getUser)
.delete(deleteUser)

router.route('/').get(getsUser)








module.exports = router;