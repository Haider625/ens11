const express = require('express');

const {
    getGroupUser,
    getsGroupUser,
    updateGroupUser,
    deleteGroupUser,
    createGroupUser,
    addGroupBetweenLevels
} = require('../serves/groupUser');

const {
    getGroupValidator,
    createGroupValidator,
    updateGroupValidator,
    deleteGroupValidator
} = require('../utils/validators/groupUser');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(auth.allowedTo('admin'),getsGroupUser)
.post(auth.allowedTo('admin'),createGroupValidator,createGroupUser);

router.route('/:id')
.get(auth.allowedTo('admin'),getGroupValidator,getGroupUser)
.delete(auth.allowedTo('admin'),deleteGroupValidator,deleteGroupUser)
.put(auth.allowedTo('admin'),updateGroupValidator,updateGroupUser)

router.post('/addlevel',addGroupBetweenLevels)
module.exports = router;