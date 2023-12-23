const express = require('express');


const {
    createUser,
    getUser,
    getsUser,
    deleteUser
} = require('../serves/userServer');
// eslint-disable-next-line no-unused-vars
const {
    createUserValidator,deleteUserValidator,getUserValidator
} = require('../utils/validators/userValidat');

const auth = require('../serves/auth')

const router = express.Router();

router.use(auth.protect);

router.route('/').post(createUserValidator,createUser,);

router.route('/:id')
.get(getUserValidator,getUser)
.delete(deleteUserValidator,deleteUser)

router.route('/').get(getsUser)








module.exports = router;