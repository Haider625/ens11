const express = require('express');

const {
    createUser,
    getUser,
    getsUser,
    deleteUser,
    updateUser,  
    uploadUserImage,
    resizeImage,
    updateLoggedUserPassword,
    changeUserPassword,
} = require('../serves/userServer');

const {
    createUserValidator,
    deleteUserValidator,
    getUserValidator,
    updateUserValidator,
    changeUserPasswordValidator,
    changeUserLoggedPasswordValidator
} = require('../utils/validators/userValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getsUser)
.post(uploadUserImage,resizeImage,createUserValidator,createUser);

router.put('/changePassword',changeUserLoggedPasswordValidator,updateLoggedUserPassword)
router.put(
    '/changePassword/:id',
    changeUserPasswordValidator,
    changeUserPassword
  );

router.route('/:id')
.get(getUserValidator,getUser)
.delete(deleteUserValidator,deleteUser)
.put(uploadUserImage,resizeImage,updateUserValidator,updateUser)


module.exports = router;