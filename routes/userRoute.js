const express = require('express');

const {
    createUser,
    getUser,
    getsUser,
    deleteUser,
    updateUser,  
    uploadUserImage,
    resizeImage
} = require('../serves/userServer');

const {
    createUserValidator,
    deleteUserValidator,
    getUserValidator,
    updateUserValidator
} = require('../utils/validators/userValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(auth.allowedTo('admin'),getsUser)
.post(auth.allowedTo('admin'),uploadUserImage,createUserValidator,createUser);

router.route('/:id')
.get(auth.allowedTo('admin'),getUserValidator,getUser)
.delete(auth.allowedTo('admin'),deleteUserValidator,deleteUser)
.put(auth.allowedTo('admin'),uploadUserImage,resizeImage,updateUserValidator,updateUser)


module.exports = router;