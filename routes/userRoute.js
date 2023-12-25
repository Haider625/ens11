const express = require('express');


const {
    createUser,getUser,getsUser,deleteUser,updateUser
} = require('../serves/userServer');
// eslint-disable-next-line no-unused-vars
const {
    createUserValidator,deleteUserValidator,getUserValidator,updateUserValidator
} = require('../utils/validators/userValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/').post(auth.allowedTo('admin'),createUserValidator,createUser,);

router.route('/:id')
.get(auth.allowedTo('admin','manger'),getUserValidator,getUser)
.delete(auth.allowedTo('admin'),deleteUserValidator,deleteUser)
.put(auth.allowedTo('admin'),updateUserValidator,updateUser)
router.route('/').get(auth.allowedTo('admin','manger'),getsUser)

module.exports = router;