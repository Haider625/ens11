const express = require('express');

const {
    getOrdersByGroup,
    getGroupscanViwGroups
} = require('../serves/viewGroup');

// const {

// } = require('../utils/validators/userValidat');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getGroupscanViwGroups)

router.route('/:groupId')
.get(getOrdersByGroup)



module.exports = router;