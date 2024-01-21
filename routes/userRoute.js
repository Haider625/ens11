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
.get(getsUser)
.post(uploadUserImage,resizeImage,createUserValidator,createUser);

router.route('/:id')
.get(getUserValidator,getUser)
.delete(deleteUserValidator,deleteUser)
.put(uploadUserImage,resizeImage,updateUserValidator,updateUser)


module.exports = router;