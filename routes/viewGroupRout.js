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
.post();

router.route('/:groupId')
.get(getOrdersByGroup)

// router.route('/:id')
// .get()
// .delete()
// .put()


module.exports = router;